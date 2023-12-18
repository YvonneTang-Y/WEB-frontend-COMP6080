// Let's say we have a constant storing aconst 
const name = 'Bindi';
// And a variable storing a numberlet 
let age = 22;
// And an objectlet 
let wildlifeWarrior = {
    name: name,
    age: age,
    gender: 'f',
};
console.log('Person:', wildlifeWarrior);

const attributes = {
    name: 'Hayden',
    age: 20,
};

for (const attr in attributes) {
    console.log(attributes[attr]);
}

const lessThan5 = (num) => {
    return num < 5;
}

nums = [1,2,3,4,5,6,7];
const newNums2 = nums.map(num => num * 2);
console.log(newNums2);
