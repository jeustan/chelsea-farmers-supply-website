var txt = ``;
const target = document.getElementsByClassName("accordion-container");
const input = `OUR LOCAL PARTNERS
Beeline Gardens
Bloodroot Herb Shop
Debbie Carlos Studios
Feral Queen
Grandy's Mice
Jacobs Fresh Farm
Nature and Nurture
Nice Life
Sideoats Native Plants
Sloe Gin Fizz
Swallowtail Pottery
SwiftBlocker
Taxonomy Press
Treehouse Block Prints

FEED
Scratch and Peck (https://www.scratchandpeck.com/)
Kalmbach (https://www.kalmbachfeeds.com/)
Tribute Equine (https://tributeequinenutrition.com/)
New Country Organics (https://www.newcountryorganics.com/)
Ideal by Standish Milling (https://standishmilling.com/)
Unbeetable Feeds (https://unbeetablefeeds.com/)
Summit Forage Products (https://summitforages.com/)
Heinold Rabbit

SEED
Bulk Cover Crop
Premium Grass Seeds
Custom/Specialty Seed Available
MIGardener 
Southern Exposure Seed Exchange
Nature and Nurture Organic Seeds
Potatoes, Onions, Garlic *Seasonal
Local Dahlia Tubers
Spring Bulbs, corms, and tubers

FARM SUPPLY
Townline Poultry Farm 
Feed Hay, Straw, and Bedding
Feeders and Waterers
Hand Tools and Implements

FOOTWEAR AND APPAREL
Muck Boot Company
Sloggers
Farmers Defence
Womens Work
Kinco

PET FOOD
Remove Iams
Fromm Family Pet Food
Dr. Gary's Best Breed
Taste of the Wild
Diamond Natural
Evangers
Nutrisouce
Orijen
Ultra Oil

SOIL AND GARDENING
Dairy DOO
Pro-Mix
FoxFarm
Niwaki Garden Tools
Opinel Knives
Seed Starting and Potting Supplies
Locally Grown Native Plants
Locally grown vegetable and flower starts
Espoma Organic Fertilizers
Down To Earth Organic Fertiilizer
Organic Pest and Disease Control

WILD BIRDS
IDEAL Seed Blends
Single Variety Seeds and Nuts
Natures Window
Birdhouses and Feeders
Hummingbird Supplies
Heath and Pinetree Suets

HOME, HEALTH, AND SUNDRY
Locally Made Pottery, Prints, and Products
Wooden Spoon Herbs
Beeline Gardens Tallow products
Local Eggs, Honey, and Maple Syrup
Canning and Food Preservation
Books, Cards, Puzzles`;

function indent(n) {
    var spaces = ``;
    for(var i=0; i<n;i++) {
        spaces += `    `;
    }
    return spaces;
}
const len = input.length;
function loadText() {
    var i = 0;
    const accordionItemStart = `<div class="accordion-item">\n${indent(1)}<button id="" class="accordion-header">`;
    const accordionHeaderEnd = `</button>\n${indent(1)}<div class="accordion-content">\n${indent(2)}<ul>`;
    const accordionItemEnd = `${indent(2)}</ul>\n${indent(1)}</div>\n</div>\n`;

    while(i < len) {
        var line = ``;
        if(i===0) {
            line = readLine(i);
            txt += `${accordionItemStart}${line}${accordionHeaderEnd}\n`;
            i += line.length;
        } else if(input[i] === `\n` && input[i+1] === `\n`) {
            txt += accordionItemEnd;
            i += 2;
            line = readLine(i);
            txt += `${accordionItemStart}${line}${accordionHeaderEnd}\n`;
            i += line.length;
        } else {
            i++;
            line = readLine(i);
            i += line.length;

            if(line.includes(`(`)) {
                const hrefStart = line.indexOf("(")+1;
                const hrefEnd = line.indexOf(")");
                const href = line.slice(hrefStart, hrefEnd);
                line = line.slice(0, hrefStart-2);
                txt += `${indent(3)}<li><a href=${href} target=_blank>${line}</a></ln>\n`
            } else {
                txt += `${indent(3)}<li>${line}</li>\n`;
            }
        }
    }
    txt += accordionItemEnd;

    console.log(txt);
    target[0].innerHTML = txt;
}

function readLine(index) {
    var line = ``;
    while(input[index] != "\n" && index<len) {
        line += input[index];
        index++;
    }

    return line;
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    loadText();
});
