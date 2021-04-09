allTBs = document.getElementsByClassName("textbox");
tbArray = Array.from(allTBs).map(e => e);
parallaxcont = document.getElementById("parallax-cont");
head = document.getElementById('heading');
main = document.getElementById('main');
scrollButton = document.getElementById('scrollButton');
sideBar = document.getElementById('sidebar');
scrollButtonPosList = [500, 1850, 2400, 3500];
scrollPosList = [0, 870, 1800, 2600];
scrollFactors = [0.8, 0.8, 0.8, 0.8];
abmeScroll = false;
projectScroll = false;
scrollList = [];
scrollIndex = 0;
barScrolled = false;
contactScroll = false;
for (let i=0; i<allTBs.length; i++) {
    scrollList.push(false);
}
trigger = window.outerHeight/window.outerWidth > 1;
if (trigger) {
    scrollButton.style.visibility = "hidden";
    sideBar.style.visibility = "hidden";
}

/*function onlyPlayOneIn(container) {
    container.addEventListener("play", function(event) {
    audio_elements = container.getElementsByTagName("audio")
        for(i=0; i < audio_elements.length; i++) {
        audio_element = audio_elements[i];
        if (audio_element !== event.target) {
            audio_element.pause();
        }
        }
    }, true);
}

document.addEventListener("DOMContentLoaded", function() {
onlyPlayOneIn(document.body);
});
*/


var myScrollDown = function() {
    scrollButton.style.transform = 'translate(-50%, ' + (scrollPosList[scrollIndex] + window.outerHeight*scrollFactors[scrollIndex]) + 'px)';
    window.scrollTo(0, scrollPosList[(scrollIndex + 1) % scrollPosList.length]);
    scrollIndex++;
    
}
scrollButton.addEventListener('click', myScrollDown);


var myScrollFunc = function() {
    textBoxWidth = Math.floor(0.1 * window.outerWidth);
    subtitleFontSize = Math.floor(0.040667 * window.outerHeight);
    infoBoxFontSize = Math.floor(0.047 * window.outerHeight);
    textBoxFontSize = Math.floor(0.02 * window.outerWidth);
    head.height = Math.floor(0.6 * window.outerHeight);
    var y = window.scrollY;
    socialsbar = document.getElementById("socialsbar");
    var newbar = socialsbar.cloneNode(true);
    if (y < 200) {
        scrollIndex = 0;
    } else if (y < 1200) {
        scrollIndex = 1;
    } else if (y < 2000) {
        scrollIndex = 2;
    } else {
        scrollIndex = 3;
    }
    scrollButton.style.transform = 'translate(-50%, ' + (scrollPosList[scrollIndex] + window.outerHeight*scrollFactors[scrollIndex]) + 'px)';

    if (y > 200) {
        newbar.style.animationDuration = "2s";
        newbar.style.animationName = "barSlideOut";
        if (!barScrolled) {
            sidebar.style.backgroundColor = "#a8dbfa"
            sidebar.style.color = "black";
            head.replaceChild(newbar, socialsbar);
            barScrolled = true;
        }
    } else {
        newbar.style.animationName = "barSlideIn";
        if (barScrolled) {
            sidebar.style.backgroundColor = "#2d6781"
            sidebar.style.color = "white";
            head.replaceChild(newbar, socialsbar);
            barScrolled = false;
        }
    }
    

    projects = document.getElementById("projects");
    projects.style.fontSize = infoBoxFontSize + 'px';
    var newprojects = projects.cloneNode(true);
    /*
    if (y > 2000) {
        newprojects.style.animationName = "fadeOutTop";
        if (!projectScroll) {
            main.replaceChild(newprojects, projects);
            projectScroll = true;
        }
    } else if (y < 1100) {
        newprojects.style.animationName = "fadeOutBottom";
        if (!projectScroll) {
            main.replaceChild(newprojects, projects);
            projectScroll = true;
        }
    } 
    */
    if (y >= 1100 && !projectScroll) {
        newprojects.style.visibility = "visible";
        newprojects.style.animationName = "fadeInBottom";
        //if (projectScroll) {
        main.replaceChild(newprojects, projects);
        projectScroll = true;
        //}
    }

    abme = document.getElementById("aboutme");
    abme.style.fontSize = infoBoxFontSize + 'px';
    var newabme = abme.cloneNode(true);
    /*
    if (y > 900) {
        newabme.style.animationName = "fadeOutTop";
        if (!abmeScroll) {
            main.replaceChild(newabme, abme);
            abmeScroll = true;
        }
    } else if (y < 200) {
        newabme.style.animationName = "fadeOutBottom";
        if (!abmeScroll) {
            main.replaceChild(newabme, abme);
            abmeScroll = true;
        }
    } 
    */
    if (y >= 200 && !abmeScroll) {
        newabme.style.visibility = "visible";
        newabme.style.animationName = "fadeInBottom";
        //if (abmeScroll) {
        main.replaceChild(newabme, abme);
        abmeScroll = true;
        //}
    }
    

    contact = document.getElementById("contact");
    contact.style.fontSize = infoBoxFontSize + 'px';
    var newcontact = contact.cloneNode(true);
    /*
    if (y < 2000) {
        newcontact.style.animationName = "fadeOutBottom";
        if (!contactScroll) {
            main.replaceChild(newcontact, contact);
            contactScroll = true;
        }
    } 
    */
    if (y >= 1500 && !contactScroll) {
        newcontact.style.visibility = "visible";
        newcontact.style.animationName = "fadeInBottom";
        //if (contactScroll) {
        main.replaceChild(newcontact, contact);
        contactScroll = true;
        //}
    }

/*
    for(let i=0; i<allTBs.length; i++) {
        if (i == 0 || i == 5) {
            allTBs[i].style.fontSize = subtitleFontSize + 'px';
        } else if (i != 7) {
            allTBs[i].style.fontSize = textBoxFontSize + 'px';
            allTBs[i].style.height = textBoxWidth + 'px';
            allTBs[i].style.width = textBoxWidth + 'px';
        }
        var start = 200;
        var end = 900;
        if (i == 2 || i == 3 || i == 1 || i == 5 || i == 6) {
            start = 1100;
            end = 2000;
        } else if (i == 7) {
            start = 2000;
            end = 4000;
        }
        var elm = allTBs[i];
        var newelm = elm.cloneNode(true);
        
        if (y < start || y > end){
            if (i == 0 || i == 5 || i == 7) {
                newelm.style.animationName = "fadeOutAbMeText";
            } else {
                newelm.style.animationName = "fadeOut";
            }
            if (scrollList[i]) {
                parallaxcont.replaceChild(newelm,elm);
                scrollList[i] = false;
            }
            allTBs[i].className = "textbox hide";
        } 
        
        if (y >= start && y <= end && !scrollList[i]) {
            if (i == 0 || i == 5 || i == 7) {
                newelm.style.animationName = "fadeInAbMeText";
            } else {
                newelm.style.animationName = "fadeIn";
            }
            newelm.style.visibility = "visible"
            //if (!scrollList[i]) {
            parallaxcont.replaceChild(newelm,elm);
            scrollList[i] = true;
            //}
            allTBs[i].className = "textbox show";
        }
    }*/
};


window.addEventListener("scroll", myScrollFunc);


window.addEventListener("scroll", () =>{
    //let parent = document.getElementById('parallax-cont');
    //let children = parent.getElementsByClassName('textbox');
    //console.log(children);
    let headChildren = head.children;
    //let abme = document.getElementById('aboutmebox');
    //let proj = document.getElementById('projectsbox');
    //let contact = document.getElementById('contactbox');
    //let y = window.scrollY;
    //abme.style.transform = 'translateY(-' + (window.pageYOffset/4) + 'px)';
    //proj.style.transform = 'translateY(-' + ((window.pageYOffset-1000)/4) + 'px)';
    //contact.style.transform = 'translateY(' + (-window.pageYOffset+2100) + 'px)';
    //for (let i=0; i < children.length; i++) {
    //children[7].style.transform = 'translateY(-' + (window.pageYOffset * (8) / children.length) + 'px)';
    //}
    if (!trigger) {
        for (let i=0; i < headChildren.length; i++) {
            if (i != headChildren.length-1) {
                headChildren[i].style.transform = 'translateY(-' + (window.pageYOffset * (i+1) / headChildren.length) + 'px)';
                headChildren[i].style.opacity = 1 - window.pageYOffset / (outerHeight/4);
            }
        }
    }
}, false)
