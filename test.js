// const departments = [{
//     name: "software Engineering",
// },
// {
//     name: "Remote Sensing and GeoInformatics",
// },
// {
//     name: "Crop Soil and Pest Management",
// },
// {
//     name: "Urban and Regional planning",
// }
// ]


// function search(text) {
//     let result = []
//     let construct_string = []
//     for (let i of departments) {
       
//         if (i.name.toLowerCase().includes(text.toLowerCase())) {
//             let index = i.name.toLowerCase().search(text.toLowerCase())
//             construct_string.push([i.name.toLowerCase().slice(0, index), text, i.name.toLowerCase().slice(index + text.length)])
//             if (i.name.toLowerCase().slice(0, text.length) === text.toLowerCase()) {
//                 result.unshift(i)
//             }
//             else {
//                 result.push(i)
//             }
//         }
       
//     }
 

//     return [result, construct_string]
// }


var data1 = Array(8).fill().map((_, i) => i);
console.log(data1);
