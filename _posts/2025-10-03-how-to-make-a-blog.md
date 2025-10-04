---
layout: post
title:  "How to make ur own blog."
date:   2025-10-03 20:17:19 -0400
---

# How to make your own blog.

For a long time now, I have been in a battle.

A mental battle. With myself. About whether I should start a blog or not.

I know there are sites that let you host one and give you a whole UI for making one, but then it's like...oh...you have a...blog...ok...like it's its own whole thing.

And then I noticed people make their blogs part of their personal websites.

Something else I did not have.

But like duh! That's so tasteful. And if it's on GitHub Pages too?? MMMMMMM yeah...that...that makes sense...

However, I was never going to build my own website from scratch either. That's too much work for someone who hasn't touched web dev since like 2021.

I just wanted to write stuff down, put some pictures up, and have it pop up with minimal work on my end.

So I was in a standoff with myself...

### That's when I came across Jekyll

# It's cool it's smooth its Jekyll

My dream had come true of being able to install a few things, run a command, then just start writing.

# So here is how you do it

### STEP 1
Go [Here](https://jekyllrb.com/docs/installation/), and pick the installation guide for your OS.

### STEP 2 Follow the instructions in the guide
Like...I don't know what else to say...Read them carefully?

### STEP 3 (OPTIONAL): Use a custom Theme
There's lot's of pre-made Themes for Jekyll. Find them through one of the links [Here](https://jekyllrb.com/docs/themes/#overriding-theme-defaults).

Each theme is saved on its own GitHub repo, and will let you use it with the "Use this template" option in the top-right, and "Create a new repository" once you click it.
![See button](/assets/images/image.png)

Each theme will guide you through the process though, the rest is above my pay grade.

### STEP 4 (IF YOU DIDN'T DO STEP 3)
Run `jekyll new my_blog_name`

Tada! You now have a bunch of new files and directories!

### STEP 5
Go into your blog directory

`cd my_blog_name`

### STEP 6: Start the server
Run `bundle exec jekyll serve` and navigate to `http://localhost:4000`

### STEP 7: Write your first post!
You should have a directory called `_posts`, and an auto-generated file that looks like `yyyy-mm-dd-welcome-to-jekyll.markdown`.

All you need to do to make a new post is create a new Markdown file formatted the same way, `yyyy-mm-dd-my-post-title.md`,

And in your post file paste and modify this:

```
---
layout: post
title:  "Put your title here"
date:   yyyy-mm-dd hh:MM:ss
---
```

And underneath, start writing in Markdown!

You're a smart cookie, you'll figure it out :)

### STEP 8: Add images!!
You may have noticed I used an image.

To do this in your own blog, you will need to create a new directory in your blog's main directory called `assets`, and within that directory, another called `images`. Add your image files here.

So you should have:

```
my_blog_name
|...
|--assets
   |--images
      |-image1.png
      |-image2.png
|...
```

Then, in any of your pages, use the Markdown syntax for adding an image

`![ alt text ]( /assets/images/image1.png )`, replacing `image1.png` with your image's filename, of course.

Also you can organize your images however you'd like once inside the `images` folder, so like:

```
my_blog_name
|...
|--assets
   |--images
      |--selfies
         |-selfie1.png
         |-selfie2.png
         |- ...
      |--book_recommendations
         |-atomic_habits.png
         |-htwfaip.png
         |-alpha_male_guide.png
         |-art_of_the_deal.png
         |-...
      |--selfies_in_pink_and_white_thigh_socks
         |-uwu1.png
         |-uwu2.png
         |-...
      |-image2.png
|...
```

Is a valid directory structure! Just reference the images when you actually use them accordingly,

i.e. `[me :3](/assets/images/selfies_in_pink_and_white_thigh_socks/uwu1.png)`.

Ok was that one way too long winded just for the bit? Yes. And I'm sorry.

![i guess i'll just k*ll myself](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVsgqlpx6KZezYlIdn11OcT47_-KeCNxzjJw&s)

*This is also a good time to note that you can simply paste links to images hosted online (which you get by right-clicking them and selecting "Copy image address"), so you don't actually have to download images of anime girls.

### STEP 9 (OPTIONAL): Modify the default templates

If you'd like to change some of the template/HTML on parts like the header, footer, homepage, etc., you can run the following to find where those default files are stored:

`bundle info --path <theme name>`

The default theme for Jekyll is `minima`.

You'll want to copy over any parts you'd like to change into your own site directory, most of the time it's stuff in the `_layouts` and `_includes` folders.

**IMPORTANT:** Keep the same directory structure, so if you're copying over something from `_layouts`, you'll need to put the file in your own `_layouts` directory, which isn't always created by default.

These files are usually *template files*, if you've ever worked with Jinja in Flask/Django (like me :D), then you'll get the hang of it. The template language is called Liquid.

If you've never used these before, you're a smart cookie. YOU can do THIS!!! (It's worth knowing, you should go find a quick guide about templating)

### STEP 10: Modify the config

In your main directory, you'll notice a `_config.yaml` file.

This is where you basically store the global variables for your site, and stuff like your name, email, social media, and site description.

You can access them within a page file (either `.html` or `.md` files) by using the templating functionality: {% raw %}`{{ site.title }}, {{ site.email }}`{% endraw %}, etc.

But of course, these are all static at the end of the day, it's just so you can reuse the same values in many places easier.


# THATS IT FOR ME FOLKS
I've taught you all that I personally know so far...

Go have fun and write blog posts!!!!

I have to actually go and write about my projects now...
![its so unfair](https://ih1.redbubble.net/image.5886372049.4444/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.jpg)