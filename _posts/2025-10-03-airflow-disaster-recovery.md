---
layout: post
title:  "Airflow Disaster Recovery Framework"
date:   2025-10-03 21:41:11 -0400
---

So back in 2024 I did this cool project during my 5th co-op term, where I was working as a Data Engineer Intern, and they tasked me with designing an automated system for recovering large amounts of data that were not processed over a period of time due to some kind of outage or failure. It was a big project, but one that also would alleviate lots of stress and tedious work from the Analytics Engineers on the Data Infra Team, who were usually the ones who had to go and manually re-run everything, sometimes with the whole Data department depending on them.

## Airflow and DAGs
Now, most of their data pipelining was done with Apache Airflow, a tool I'd learned how to use back in my second co-op term. It basically is constructed entirely off the concept of a Directed Acyclic Graph (DAG), which is a series of vertices, which are basically tasks, and edges between those vertices, with one vertex always pointing to another, drawing dependencies between tasks.

The rule with DAGs is that they cannot have cycles where all the edges point the same direction, hence the name Directed **Acyclic** Graphs. This makes sense, because if task B needs the output of task A to proceed with its own process, but task A also needs task B's output, neither would be able to run ever. There's an added dimension of time to it all, A needs to complete *before* B.

But at the core, a task is just some code that you want to be run, and DAGs are a way to organize tasks when they depend on other tasks or have complex relationships between each other. Airflow mainly acts as a scheduler and orchestrator for these cases.

E.g. If I needed to compute some data D, and I wanted to then process D in 2 different ways, I could set up a DAG as follows:

```
Task A creates D --> Task B processes D, creates D_1 --> Task C processes D, creates D_2
```
Airflow would orchestrate these tasks to run as A -> B -> C.

Or, alternatively,

```
Task A creates D --> Task B processes D, creates D_1
                  \--->Task C processes D, creates D_2
```
Airflow would orchestrate these tasks to run as A -> B and C at the same time.

So Airflow enables this kind of parallel branching of processes as well, which is quite powerful. You can configure these DAGs to run at certain intervals, like a CRON job (that was actually what they did before Airflow became a thing), which is the scheduler part of Airflow.

Thus, with some Python code, you can create a DAG, which is a collection of tasks, where there is at least one task that acts as a root, and all the other tasks lay downstream from those roots. This DAG will run tasks starting at the roots, then trickle down to the end of each dependency path, and you end up with some desired output state, i.e. new data saved to some table.

## Make sense?
Ok sweet.

## The Problem?
![problem?](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfcLk7LUBvL2_BqXa7jnSE9AEgtE3mga1IpA&s)

Now as the company's data operations scaled up, so did their number of DAGs. I think when I was working they had about 1000 of them. Many were old and unused, but lots were active and running at intervals as frequent as every 15 minutes.

There were scrapers, data ingestion, metrics computations, model training, etc. All the stuff you'd expect to find at a data-driven B2B marketplace company.

But there was one other caveat to all this.

DAGs themselves could be dependent on other DAGs or other DAGs' tasks.

When you think about this, it becomes obvious.

There's some data that is just insanely crucial to many components of a business: user information, event logs, model features, etc.

You can't possibly fit everything that uses any of those all into the same DAG that generates them (well you can, but that'd be a nightmare to look at and manage).

So, you use these things called **Sensors**, which are basically "cross-DAG dependency edges".

Sensors allow a DAG to "reach over" the realm of all DAGs and target some specific task, then ask that task "Have you completed yet at your latest scheduled interval?".

Then, only once the Sensor finds that the dependency task has been run, the tasks downstream from the Sensor will be scheduled.

We ended up having tens of DAGs all hooked up with Sensors to one central DAG, which would process the last day's relevant data overnight, then the next day, all those DAGs could run with fresh data.

Then, more often than not, some of those DAGs would have outputs that other DAGs would want to use, so they'd hook Sensors to those.

Then more DAGs build on top of that data, and so on...

You end up with this cascading web of a bunch of data stores that all ultimately depend on one core DAG.

So, sometimes when AWS would go down, or faulty code was pushed, or that core DAG just didn't finish in time, we'd see the whole web of DAGs stall...Red. Everywhere.

Now, was this a design flaw? Yeah most definitely. But were we going to go through and untangle all those wires and reroute them? Hell no!

It was like the 2008 Housing Crisis whenever an outage hit, it was actually insane. Slack would blow up, everyone would be stressed tf out, there'd be 100+ pings the #data-help channel from people asking when their dashboard would be back up.

## The Solution
So I basically went and tracked down where all the metadata regarding these Sensors and dependencies lived.

My initial intuition was to pool together all this graph data and string together some order of DAGs which would have to be re-run.

Generally, when one of these incidents hit, the team would know which core DAG was the one that was affected, and obviously when the incident began and ended (from the first DAG failure to the time of the fix), so through a YAML file, one would supply the following:

```
- relevant_dags
- incident_start_time
- incident_end_time
```

From here, do some graph search, gather all the DAGs that depend on these relevant_dags, and then their dependent DAGs, and so on, then re-trigger them all day-by-day. Simple enough!

## Oopsie!
Wellll actually, I forgot one important detail about Airflow. It's not the DAGs that are actually running, it's the tasks. I noticed that when I tried running my initial solution, it would hang. This was because there were some DAGs that actually, from a DAG-level, were cyclic!

They'd be looking like this!
```
DAG 1          DAG 2
 a --------     d
 |         \    |
 V          \   V
 b           \->e
 |    ----------|
 V   /          V
 c<-/           f
```

So, task-wise, no cycles, since you could run them in this order: `a & d -> b & e -> c & f` without ever creating a loop.

But, DAG-wise, all I saw was this (excuse my shitty text arrows):

```
DAG 1 ----> DAG 2
 ^----------/
```

## Ok so that didn't work
I had to pivot and make TASKS the atomic unit of my algorithm.

I eventually settled on a 2 pass solution:

- The first pass would still create a DAG-level dependency graph, starting from the `relevant_dags`, essentially an ancestor graph (`relevant_dags` and all descendants of `relevant_dags`)
  - I learned that we had fact tables in our data warehouse that tracked all our registered DAGs and their tasksk, including Sensor metadata.
  - I would use the DAGs found in the ancestor graph to query the task fact table for the task nodes and Sensor dependencies.
- The second pass would use the returned query data to construct a new task-level graph, connecting by both inter- and intra-DAG links, accounting for the cyclic edge case.
  - This is the graph I would eventually use for orchestrating the task re-runs.

## Creating an execution plan
Now, when executing the re-runs, there was the added consideration of DAG cadences, as many DAGs executed on slightly different timings. There were many daily, hourly, and weekly DAGs that were usually closely tied. So, I first compute all the execution times that were missed during the incident time range, based on the DAG interval definition, and augment the graph with these timestamps.

## Running the execution plan
Ok, ok, NOW it's as simple as traversing the graph. Go in topological order, I opted for a BFS-based topo-sort, by tracking the number of pending in-neighbours for each node, and only queuing nodes that have 0 pending, meaning all their dependencies have been visited and executed.

I leveraged the Airflow API to create new DagRun instances, and let the scheduler fill in each DAG with task instances. I then marked any that did not need to be re-run as complete, so as to not waste compute, then triggered execution for every execution time listed. If DAG B is reliant on DAG A every day, then it's fine to run DAG A for every day it missed first, then look at DAG B only when DAG A was fully caught up. 

This was the best plan I could think of at the time, due to the messiness of having to traverse the time dimension for many intervals that did not always line up. That would mean re-traversing the graph for the max number of execution times any task had, and each time you retraversed, the paths you would propagate downward were not always the same. I think with more time and effort, it would be possible, but I deemed it out of reach for my time there.

I recognize that there are edge cases, like tasks that fully rewrite a table each day, so if you ran all of its runs sequentially first, then its dependents', every run of the dependent tasks would see only the last day's data, which was not the intended behaviour. I thus filtered these cases out via type of SQL task, and marked them as requiring human review & manual re-run.

## Cost estimation
An important selling point of this (for everyone other than the Data Infra Team) was that we could also generate an estimated cost report of performing all these re-runs, since many DAGs were pretty chunky SQL queries on our Snowflake warehouse, costing compute credits.

I went about this by checking our Snowflake logs, stored also in a fact table, and it was as simple as querying for the set of Airflow DAG/task that ran the query, metadata which was stored alongside the query call (thankfully). There were some small exceptions, like DAGs with barebones tasks that simply executed raw SQL and did not decorate its requests with extra info, but those were negligible in count. I'd average the cost of the past k number of runs for each task, then return those numbers in my query.

## Integration with GitHub Actions
I wanted this tool to be accessible to stakeholders, not just the Data Infra Team, so they could get some early insights and estimations of cost and work for executing re-runs automatically, then the only work required by the Infra Team was to approve the executions.

This would be done by opening a new PR and adding a new YAML config file in a certain directory. Adding this file in that specific directory would mark this PR as being valid to trigger a GitHub Actions workflow to start running the graph algorithm scripts and generate a report on all the tasks and execution times affected with their cost estimation. These were formatted into a table that would then be outputted as a comment in the PR, posted by the GitHub bot via calling the GitHub API from inside the Actions Workflow.

To actually trigger the workflow, I used a comment hook and detected when a certain "command" (like "/rerun-analysis") was commented in that PR with modifications to that directory.

The workflow also would generate the execution plan and save it as a JSON file, with all the graph information in there and execution times for each node.

I had lots of fun working with GitHub Actions and it led to me helping out later to debug and repair an important workflow for SQL validation that went down, I got to sharpen my skills working with remote workers and debugging in a that kind of ephemeral, containerized environment.

## Infrastructure considerations
Now, there were some concerns regarding where these executions would all happen. We couldn't run them on the main Airflow server instance, because that would potentially clog the up-to-date runs from executing. So, we opted to design a two-instance system.

On the production instance, there was an orchestrator DAG, which I hooked up to the GitHub Actions workflow. By saving the execution plan in the repo linked to the Airflow instance, it would also get copied into our Airflow deployment, so the workflow could simply call the Airflow API to start up the orchestrator DAG and pass along an argument for the filepath to the execution plan within the deployment's file system, which mirrored our repo's.

Then, we would spin up a secondary, fresh Airflow deployment, linked to our prod data, and the orchestrator DAG on our main deployment would use the execution plan to ping the secondary deployment and begin instantiating, scheduling, and executing all these re-runs. This was really cool to see in real-time.

# Final Notes
This was by far the coolest co-op project I've gotten to work on, but when it came time to present my work, I fell really flat. I hadn't done nearly as much prep for my presentation, and I had a shaky live demo that was too zoomed-out, used shoddy examples, and didn't present enough motivation for why this was any good for the department.

It kind of sucked because I could feel the energy drain from the meeting as my presentation went on, and because this was genuinely something that took my whole attention and effort for a few months.

I could already feel that this system was gonna get immediately forgotten in some dark corner of the repository.

But, it's given me a lot to think about and work on in regards to how I market myself and my work. I am trying to not make that same mistake again.

I still love problems that require graph data and I do think that I really upped my game in that category of problem through this project. It was seriously a very fleshed out, end-to-end design that I have the privilege to call my own, with all its bumps and warts.

Thank you for getting all the way here if you're still reading! I hope you enjoyed my rambling of past work, and that it may be of some value to you!