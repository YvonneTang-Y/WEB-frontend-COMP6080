// Show off how to use fetch
function getFile() {
    const url = "https://api.chucknorris.io/jokes/random/blob";

    fetch(url)
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error(`Error: ${res.status}`);
            }
        })
        .then(data => document.getElementById("meme-txt").textContent = data.value)
        .catch(() => console.error("There was a network error!!!!"));

    // const xhr = new XMLHttpRequest();
    // xhr.open("GET", url);
    //
    // xhr.onload = () => {
    //     if (xhr.status === 200) {
    //         const meme = JSON.parse(xhr.response);
    //
    //         document.getElementById("meme-txt").textContent = meme.value;
    //     } else {
    //         console.error(`Error: ${xhr.status}`);
    //     }
    // }
    //
    // xhr.onerror = () => {
    //     console.error("Could not complete sending request");
    // }
    //
    // try {
    //     xhr.send();
    // } catch(e) {
    //     console.error("Cannot start sending request!");
    // }
}

function main() {
    document.getElementById("fetch-btn").addEventListener("click", getFile );
}

main();