import './ui.css';
import $ from "jquery";

let emojiUnicodeList = [];

$(document).ready(function () {
    var container = document.getElementById('container');
    var search = container.querySelector('input[type="text"]');
    if (search) {
        search.focus();
        search.onkeydown = inputKeyDown;
    }
});

const inputKeyDown = e => {
    if (event.keyCode === 13) {  // enter
        console.log("start search iconfont: " + e.target.value);
        postIconSearch(e.target.value);
    }
    return;
}

const createIconEl = iconData => {
    var item = document.createElement("li");
    item.onclick = function() { fetchSVG(iconData) };

    var icon = document.createElement("div");
    icon.setAttribute("class", "icon-twrap");
    icon.innerHTML = iconData["svg"];
    item.appendChild(icon);

    var iconName = document.createElement("span");
    iconName.setAttribute("class", "icon-name");
    iconName.innerText = iconData["name"];
    item.appendChild(iconName);
    return item;
};

const postIconSearch = q => {
    var $iconContainer = $("#iconfont-container");
    var $errContainer = $("#error");
    $iconContainer.scrollTop(0);

    fetch("https://youdianzhishi.com/api/v1/icon/search/?q=" + q)
    .then(res =>  res.json())
    .then(result => {
        $iconContainer.empty();
        var count = result['count'];
        var icons = result['icons'];
        for(let i=0; i<icons.length; i++) {
            $iconContainer.append(createIconEl(icons[i]));
        }
    })
    .catch((err) => {
        console.log('There was an issue while fetching the iconfont list', err);
        $iconContainer.attr('style', 'display:none');
        $errContainer.attr('style', 'display:flex');
    });
}

// Adding shadow on scroll
$('#iconfont-container').on('scroll', function() {
    if (!$('#iconfont-container').scrollTop()) {
        $('.container').removeClass('shadow')    
    } else {
        $('.container').addClass('shadow')
    }
})

// Asking figma to add selected svg onto canvas
const fetchSVG = (result) => {
    parent.postMessage({
        pluginMessage: {
            event: 'insert-svg',
            svg: result["svg"],
            icon: {
                slug: result["slug"]
            }
        }
    }, '*');
}
