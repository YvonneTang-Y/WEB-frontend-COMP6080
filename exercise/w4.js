function startCalculating() {
  // do a Loooooooong calculation
  const n = 1000000;
  for (let i = 1; i <= n; ++i) {
    document.getElementById("calc-txt").textContent = i.toString();
  }
}

function startCounting() {
  console.Log("starting to count up...")
  let i = 0;
  setInterval(() => {
    i += 1;
    document.getElementById(elementld: "counter-txt").textContent = i.toString();
  }, timeout: 1000);

}

function main() {
  const counterBtn = document.getElementById(elementld: "start-counting-btn");
  const factorialBtn = document.getElementById(elementld: "start-calc-btn");

  counterBtn.addEventListener("click",startCounting);
  factorialBtn.addEventListener("click", startCalculating);
}

main()