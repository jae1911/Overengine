function makeSpoiler() {
    let pageElement = document.getElementById('spoilerMaker');
    
    pageElement.style.filter = 'blur(10px)';
}

makeSpoiler();

function removeSpoiler() {
    let pageElement = document.getElementById('spoilerMaker');
    
    pageElement.style.filter = '';
}

function removeSpoilerPopup() {
    let pageElement = document.getElementById('spoilerPopup');
    
    pageElement.style.display = 'none';
}

document.getElementById('acceptBtn').onclick = function () {
    removeSpoiler();
    removeSpoilerPopup();
}

document.getElementById('returnBtn').onclick = function () {
    window.location.href = '/';
}
