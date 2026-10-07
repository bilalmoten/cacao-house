import type {IngredientVariety,OriginProfile} from '../model.ts';
// Fictionalized seasonal calendars for game forecasts, not agricultural claims.
export const origins:OriginProfile[] = [
  {
    "id": "ecuador",
    "name": "Ecuador",
    "stage": 1,
    "flavor": [
      8,
      7,
      2,
      1
    ],
    "cycleFactor": 1.04,
    "yieldFactor": 0.97,
    "harvest": [
      [
        12,
        24
      ],
      [
        40,
        48
      ]
    ],
    "baseSupplyGrams": 600000
  },
  {
    "id": "ghana",
    "name": "Ghana",
    "stage": 1,
    "flavor": [
      9,
      2,
      7,
      1
    ],
    "cycleFactor": 0.97,
    "yieldFactor": 0.99,
    "harvest": [
      [
        1,
        14
      ],
      [
        32,
        40
      ]
    ],
    "baseSupplyGrams": 1200000
  },
  {
    "id": "brazil",
    "name": "Brazil",
    "stage": 3,
    "flavor": [
      7,
      5,
      4,
      2
    ],
    "cycleFactor": 1.02,
    "yieldFactor": 0.96,
    "harvest": [
      [
        18,
        30
      ],
      [
        44,
        52
      ]
    ],
    "baseSupplyGrams": 800000
  },
  {
    "id": "mexico",
    "name": "Mexico",
    "stage": 2,
    "flavor": [
      6,
      4,
      3,
      8
    ],
    "cycleFactor": 1.08,
    "yieldFactor": 0.95,
    "harvest": [
      [
        4,
        16
      ]
    ],
    "baseSupplyGrams": 420000
  },
  {
    "id": "peru",
    "name": "Peru",
    "stage": 2,
    "flavor": [
      7,
      8,
      2,
      1
    ],
    "cycleFactor": 1.1,
    "yieldFactor": 0.96,
    "harvest": [
      [
        20,
        32
      ]
    ],
    "baseSupplyGrams": 480000
  },
  {
    "id": "madagascar",
    "name": "Madagascar",
    "stage": 4,
    "flavor": [
      6,
      9,
      2,
      1
    ],
    "cycleFactor": 1.12,
    "yieldFactor": 0.94,
    "harvest": [
      [
        7,
        19
      ]
    ],
    "baseSupplyGrams": 300000
  },
  {
    "id": "dominican",
    "name": "Dominican Republic",
    "stage": 5,
    "flavor": [
      8,
      6,
      4,
      2
    ],
    "cycleFactor": 1.03,
    "yieldFactor": 0.97,
    "harvest": [
      [
        15,
        27
      ],
      [
        38,
        44
      ]
    ],
    "baseSupplyGrams": 550000
  },
  {
    "id": "vietnam",
    "name": "Vietnam",
    "stage": 6,
    "flavor": [
      7,
      7,
      3,
      5
    ],
    "cycleFactor": 1.07,
    "yieldFactor": 0.96,
    "harvest": [
      [
        2,
        12
      ],
      [
        28,
        36
      ]
    ],
    "baseSupplyGrams": 380000
  }
];
export const ingredients:IngredientVariety[] = [
  {
    "id": "cocoa-ecuador",
    "name": "Ecuador cocoa",
    "familyId": "cocoa",
    "stage": 1,
    "roles": [
      "cocoa"
    ],
    "form": "liquor",
    "storageClass": "controlled",
    "shelfWeeks": 30,
    "gramsPerLiter": 1100,
    "flavor": [
      8,
      7,
      2,
      1
    ],
    "cycleFactor": 1.04,
    "yieldFactor": 0.97,
    "harvest": [
      [
        12,
        24
      ],
      [
        40,
        48
      ]
    ],
    "baseCentsPerKg": 650,
    "originId": "ecuador"
  },
  {
    "id": "cocoa-ghana",
    "name": "Ghana cocoa",
    "familyId": "cocoa",
    "stage": 1,
    "roles": [
      "cocoa"
    ],
    "form": "liquor",
    "storageClass": "controlled",
    "shelfWeeks": 34,
    "gramsPerLiter": 1100,
    "flavor": [
      9,
      2,
      7,
      1
    ],
    "cycleFactor": 0.97,
    "yieldFactor": 0.99,
    "harvest": [
      [
        1,
        14
      ],
      [
        32,
        40
      ]
    ],
    "baseCentsPerKg": 480,
    "originId": "ghana"
  },
  {
    "id": "cocoa-brazil",
    "name": "Brazil cocoa",
    "familyId": "cocoa",
    "stage": 3,
    "roles": [
      "cocoa"
    ],
    "form": "liquor",
    "storageClass": "controlled",
    "shelfWeeks": 38,
    "gramsPerLiter": 1100,
    "flavor": [
      7,
      5,
      4,
      2
    ],
    "cycleFactor": 1.02,
    "yieldFactor": 0.96,
    "harvest": [
      [
        18,
        30
      ],
      [
        44,
        52
      ]
    ],
    "baseCentsPerKg": 560,
    "originId": "brazil"
  },
  {
    "id": "cocoa-mexico",
    "name": "Mexico cocoa",
    "familyId": "cocoa",
    "stage": 2,
    "roles": [
      "cocoa"
    ],
    "form": "liquor",
    "storageClass": "controlled",
    "shelfWeeks": 30,
    "gramsPerLiter": 1100,
    "flavor": [
      6,
      4,
      3,
      8
    ],
    "cycleFactor": 1.08,
    "yieldFactor": 0.95,
    "harvest": [
      [
        4,
        16
      ]
    ],
    "baseCentsPerKg": 720,
    "originId": "mexico"
  },
  {
    "id": "cocoa-peru",
    "name": "Peru cocoa",
    "familyId": "cocoa",
    "stage": 2,
    "roles": [
      "cocoa"
    ],
    "form": "liquor",
    "storageClass": "controlled",
    "shelfWeeks": 34,
    "gramsPerLiter": 1100,
    "flavor": [
      7,
      8,
      2,
      1
    ],
    "cycleFactor": 1.1,
    "yieldFactor": 0.96,
    "harvest": [
      [
        20,
        32
      ]
    ],
    "baseCentsPerKg": 790,
    "originId": "peru"
  },
  {
    "id": "cocoa-madagascar",
    "name": "Madagascar cocoa",
    "familyId": "cocoa",
    "stage": 4,
    "roles": [
      "cocoa"
    ],
    "form": "liquor",
    "storageClass": "controlled",
    "shelfWeeks": 38,
    "gramsPerLiter": 1100,
    "flavor": [
      6,
      9,
      2,
      1
    ],
    "cycleFactor": 1.12,
    "yieldFactor": 0.94,
    "harvest": [
      [
        7,
        19
      ]
    ],
    "baseCentsPerKg": 980,
    "originId": "madagascar"
  },
  {
    "id": "cocoa-dominican",
    "name": "Dominican Republic cocoa",
    "familyId": "cocoa",
    "stage": 5,
    "roles": [
      "cocoa"
    ],
    "form": "liquor",
    "storageClass": "controlled",
    "shelfWeeks": 30,
    "gramsPerLiter": 1100,
    "flavor": [
      8,
      6,
      4,
      2
    ],
    "cycleFactor": 1.03,
    "yieldFactor": 0.97,
    "harvest": [
      [
        15,
        27
      ],
      [
        38,
        44
      ]
    ],
    "baseCentsPerKg": 760,
    "originId": "dominican"
  },
  {
    "id": "cocoa-vietnam",
    "name": "Vietnam cocoa",
    "familyId": "cocoa",
    "stage": 6,
    "roles": [
      "cocoa"
    ],
    "form": "liquor",
    "storageClass": "controlled",
    "shelfWeeks": 34,
    "gramsPerLiter": 1100,
    "flavor": [
      7,
      7,
      3,
      5
    ],
    "cycleFactor": 1.07,
    "yieldFactor": 0.96,
    "harvest": [
      [
        2,
        12
      ],
      [
        28,
        36
      ]
    ],
    "baseCentsPerKg": 850,
    "originId": "vietnam"
  },
  {
    "id": "sugar-refined",
    "name": "Refined cane sugar",
    "familyId": "sweeteners",
    "stage": 1,
    "roles": [
      "sweetener"
    ],
    "form": "crystal",
    "storageClass": "dry",
    "shelfWeeks": 52,
    "gramsPerLiter": 850,
    "flavor": [
      1,
      1,
      0,
      0
    ],
    "cycleFactor": 1,
    "yieldFactor": 1,
    "harvest": [
      [
        1,
        52
      ]
    ],
    "baseCentsPerKg": 120
  },
  {
    "id": "sugar-raw",
    "name": "Raw cane sugar",
    "familyId": "sweeteners",
    "stage": 2,
    "roles": [
      "sweetener"
    ],
    "form": "crystal",
    "storageClass": "dry",
    "shelfWeeks": 40,
    "gramsPerLiter": 820,
    "flavor": [
      2,
      1,
      3,
      1
    ],
    "cycleFactor": 1.04,
    "yieldFactor": 0.99,
    "harvest": [
      [
        9,
        26
      ]
    ],
    "baseCentsPerKg": 150
  },
  {
    "id": "panela",
    "name": "Panela",
    "familyId": "sweeteners",
    "stage": 2,
    "roles": [
      "sweetener"
    ],
    "form": "block",
    "storageClass": "dry",
    "shelfWeeks": 26,
    "gramsPerLiter": 900,
    "flavor": [
      2,
      2,
      5,
      2
    ],
    "cycleFactor": 1.12,
    "yieldFactor": 0.97,
    "harvest": [
      [
        24,
        40
      ]
    ],
    "baseCentsPerKg": 210
  },
  {
    "id": "milk-powder",
    "name": "Milk powder",
    "familyId": "dairy",
    "stage": 1,
    "roles": [
      "dairy"
    ],
    "form": "powder",
    "storageClass": "dry",
    "shelfWeeks": 26,
    "gramsPerLiter": 600,
    "flavor": [
      2,
      1,
      1,
      0
    ],
    "cycleFactor": 1,
    "yieldFactor": 1,
    "harvest": [
      [
        1,
        52
      ]
    ],
    "baseCentsPerKg": 410
  },
  {
    "id": "cream-powder",
    "name": "Cream powder",
    "familyId": "dairy",
    "stage": 3,
    "roles": [
      "cream"
    ],
    "form": "powder",
    "storageClass": "controlled",
    "shelfWeeks": 16,
    "gramsPerLiter": 650,
    "flavor": [
      2,
      1,
      2,
      0
    ],
    "cycleFactor": 1.04,
    "yieldFactor": 0.98,
    "harvest": [
      [
        1,
        52
      ]
    ],
    "baseCentsPerKg": 630
  },
  {
    "id": "butter",
    "name": "Butter",
    "familyId": "dairy",
    "stage": 4,
    "roles": [
      "fat"
    ],
    "form": "solid",
    "storageClass": "cold",
    "shelfWeeks": 6,
    "gramsPerLiter": 910,
    "flavor": [
      1,
      1,
      2,
      0
    ],
    "cycleFactor": 1.08,
    "yieldFactor": 0.96,
    "harvest": [
      [
        1,
        52
      ]
    ],
    "baseCentsPerKg": 520
  },
  {
    "id": "hazelnut",
    "name": "Hazelnut",
    "familyId": "nuts",
    "stage": 2,
    "roles": [
      "nut"
    ],
    "form": "whole",
    "storageClass": "controlled",
    "shelfWeeks": 16,
    "gramsPerLiter": 610,
    "flavor": [
      1,
      2,
      9,
      0
    ],
    "cycleFactor": 1.12,
    "yieldFactor": 0.96,
    "harvest": [
      [
        33,
        42
      ]
    ],
    "baseCentsPerKg": 950
  },
  {
    "id": "pistachio",
    "name": "Pistachio",
    "familyId": "nuts",
    "stage": 3,
    "roles": [
      "nut"
    ],
    "form": "whole",
    "storageClass": "controlled",
    "shelfWeeks": 14,
    "gramsPerLiter": 570,
    "flavor": [
      1,
      3,
      7,
      1
    ],
    "cycleFactor": 1.15,
    "yieldFactor": 0.94,
    "harvest": [
      [
        35,
        44
      ]
    ],
    "baseCentsPerKg": 1600
  },
  {
    "id": "almond",
    "name": "Almond",
    "familyId": "nuts",
    "stage": 4,
    "roles": [
      "nut"
    ],
    "form": "whole",
    "storageClass": "controlled",
    "shelfWeeks": 20,
    "gramsPerLiter": 590,
    "flavor": [
      1,
      2,
      6,
      1
    ],
    "cycleFactor": 1.07,
    "yieldFactor": 0.98,
    "harvest": [
      [
        30,
        40
      ]
    ],
    "baseCentsPerKg": 780
  },
  {
    "id": "peanut",
    "name": "Peanut",
    "familyId": "nuts",
    "stage": 4,
    "roles": [
      "nut"
    ],
    "form": "whole",
    "storageClass": "dry",
    "shelfWeeks": 18,
    "gramsPerLiter": 620,
    "flavor": [
      1,
      1,
      8,
      0
    ],
    "cycleFactor": 0.96,
    "yieldFactor": 0.99,
    "harvest": [
      [
        16,
        26
      ]
    ],
    "baseCentsPerKg": 330
  },
  {
    "id": "cashew",
    "name": "Cashew",
    "familyId": "nuts",
    "stage": 3,
    "roles": [
      "nut"
    ],
    "form": "whole",
    "storageClass": "controlled",
    "shelfWeeks": 16,
    "gramsPerLiter": 540,
    "flavor": [
      1,
      3,
      5,
      0
    ],
    "cycleFactor": 1.08,
    "yieldFactor": 0.95,
    "harvest": [
      [
        3,
        15
      ]
    ],
    "baseCentsPerKg": 820
  },
  {
    "id": "pecan",
    "name": "Pecan",
    "familyId": "nuts",
    "stage": 5,
    "roles": [
      "nut"
    ],
    "form": "whole",
    "storageClass": "controlled",
    "shelfWeeks": 12,
    "gramsPerLiter": 520,
    "flavor": [
      1,
      2,
      8,
      2
    ],
    "cycleFactor": 1.16,
    "yieldFactor": 0.94,
    "harvest": [
      [
        40,
        50
      ]
    ],
    "baseCentsPerKg": 1100
  },
  {
    "id": "orange-peel",
    "name": "Orange peel",
    "familyId": "fruit",
    "stage": 2,
    "roles": [
      "fruit"
    ],
    "form": "candied",
    "storageClass": "dry",
    "shelfWeeks": 16,
    "gramsPerLiter": 740,
    "flavor": [
      1,
      9,
      0,
      2
    ],
    "cycleFactor": 1.05,
    "yieldFactor": 0.98,
    "harvest": [
      [
        2,
        14
      ]
    ],
    "baseCentsPerKg": 520
  },
  {
    "id": "lemon-peel",
    "name": "Lemon peel",
    "familyId": "fruit",
    "stage": 5,
    "roles": [
      "fruit"
    ],
    "form": "candied",
    "storageClass": "dry",
    "shelfWeeks": 14,
    "gramsPerLiter": 700,
    "flavor": [
      0,
      10,
      0,
      1
    ],
    "cycleFactor": 1.08,
    "yieldFactor": 0.96,
    "harvest": [
      [
        12,
        24
      ]
    ],
    "baseCentsPerKg": 570
  },
  {
    "id": "berry",
    "name": "Berry preparation",
    "familyId": "fruit",
    "stage": 6,
    "roles": [
      "fruit"
    ],
    "form": "paste",
    "storageClass": "cold",
    "shelfWeeks": 5,
    "gramsPerLiter": 1100,
    "flavor": [
      0,
      9,
      0,
      0
    ],
    "cycleFactor": 1.15,
    "yieldFactor": 0.93,
    "harvest": [
      [
        20,
        32
      ]
    ],
    "baseCentsPerKg": 780
  },
  {
    "id": "passion-fruit",
    "name": "Passion-fruit puree",
    "familyId": "fruit",
    "stage": 3,
    "roles": [
      "fruit"
    ],
    "form": "liquid",
    "storageClass": "cold",
    "shelfWeeks": 4,
    "gramsPerLiter": 1040,
    "flavor": [
      0,
      10,
      0,
      1
    ],
    "cycleFactor": 1.2,
    "yieldFactor": 0.9,
    "harvest": [
      [
        10,
        22
      ]
    ],
    "baseCentsPerKg": 620
  },
  {
    "id": "mango",
    "name": "Mango puree",
    "familyId": "fruit",
    "stage": 4,
    "roles": [
      "fruit"
    ],
    "form": "liquid",
    "storageClass": "cold",
    "shelfWeeks": 4,
    "gramsPerLiter": 1050,
    "flavor": [
      0,
      8,
      0,
      2
    ],
    "cycleFactor": 1.16,
    "yieldFactor": 0.92,
    "harvest": [
      [
        22,
        34
      ]
    ],
    "baseCentsPerKg": 540
  },
  {
    "id": "matcha",
    "name": "Matcha",
    "familyId": "tea",
    "stage": 3,
    "roles": [
      "tea"
    ],
    "form": "powder",
    "storageClass": "controlled",
    "shelfWeeks": 12,
    "gramsPerLiter": 420,
    "flavor": [
      1,
      3,
      3,
      2
    ],
    "cycleFactor": 1.08,
    "yieldFactor": 0.96,
    "harvest": [
      [
        14,
        20
      ]
    ],
    "baseCentsPerKg": 3400
  },
  {
    "id": "roasted-tea",
    "name": "Roasted green tea",
    "familyId": "tea",
    "stage": 3,
    "roles": [
      "tea"
    ],
    "form": "powder",
    "storageClass": "dry",
    "shelfWeeks": 20,
    "gramsPerLiter": 380,
    "flavor": [
      1,
      2,
      8,
      1
    ],
    "cycleFactor": 1.03,
    "yieldFactor": 0.98,
    "harvest": [
      [
        25,
        32
      ]
    ],
    "baseCentsPerKg": 1800
  },
  {
    "id": "black-tea",
    "name": "Black tea",
    "familyId": "tea",
    "stage": 3,
    "roles": [
      "tea"
    ],
    "form": "powder",
    "storageClass": "dry",
    "shelfWeeks": 24,
    "gramsPerLiter": 410,
    "flavor": [
      1,
      4,
      4,
      3
    ],
    "cycleFactor": 1.06,
    "yieldFactor": 0.97,
    "harvest": [
      [
        6,
        16
      ]
    ],
    "baseCentsPerKg": 1200
  },
  {
    "id": "vanilla",
    "name": "Vanilla",
    "familyId": "spices",
    "stage": 1,
    "roles": [
      "spice"
    ],
    "form": "extract",
    "storageClass": "controlled",
    "shelfWeeks": 26,
    "gramsPerLiter": 1000,
    "flavor": [
      2,
      2,
      1,
      6
    ],
    "cycleFactor": 1,
    "yieldFactor": 0.99,
    "harvest": [
      [
        18,
        30
      ]
    ],
    "baseCentsPerKg": 6500
  },
  {
    "id": "cardamom",
    "name": "Cardamom",
    "familyId": "spices",
    "stage": 4,
    "roles": [
      "spice"
    ],
    "form": "powder",
    "storageClass": "dry",
    "shelfWeeks": 20,
    "gramsPerLiter": 430,
    "flavor": [
      1,
      3,
      0,
      10
    ],
    "cycleFactor": 1.07,
    "yieldFactor": 0.97,
    "harvest": [
      [
        28,
        40
      ]
    ],
    "baseCentsPerKg": 3800
  },
  {
    "id": "cinnamon",
    "name": "Cinnamon",
    "familyId": "spices",
    "stage": 2,
    "roles": [
      "spice"
    ],
    "form": "powder",
    "storageClass": "dry",
    "shelfWeeks": 26,
    "gramsPerLiter": 440,
    "flavor": [
      1,
      1,
      3,
      9
    ],
    "cycleFactor": 1.03,
    "yieldFactor": 0.98,
    "harvest": [
      [
        8,
        20
      ]
    ],
    "baseCentsPerKg": 1600
  },
  {
    "id": "wafer",
    "name": "Wafer pieces",
    "familyId": "grains",
    "stage": 4,
    "roles": [
      "grain"
    ],
    "form": "pieces",
    "storageClass": "dry",
    "shelfWeeks": 12,
    "gramsPerLiter": 250,
    "flavor": [
      0,
      0,
      5,
      0
    ],
    "cycleFactor": 0.97,
    "yieldFactor": 0.95,
    "harvest": [
      [
        1,
        52
      ]
    ],
    "baseCentsPerKg": 420
  },
  {
    "id": "crisp-rice",
    "name": "Crisp rice",
    "familyId": "grains",
    "stage": 3,
    "roles": [
      "grain"
    ],
    "form": "pieces",
    "storageClass": "dry",
    "shelfWeeks": 18,
    "gramsPerLiter": 210,
    "flavor": [
      0,
      0,
      4,
      0
    ],
    "cycleFactor": 0.95,
    "yieldFactor": 0.98,
    "harvest": [
      [
        1,
        52
      ]
    ],
    "baseCentsPerKg": 310
  },
  {
    "id": "coconut",
    "name": "Coconut base",
    "familyId": "plant",
    "stage": 3,
    "roles": [
      "plant"
    ],
    "form": "powder",
    "storageClass": "dry",
    "shelfWeeks": 20,
    "gramsPerLiter": 600,
    "flavor": [
      1,
      4,
      2,
      1
    ],
    "cycleFactor": 1.04,
    "yieldFactor": 0.97,
    "harvest": [
      [
        2,
        18
      ],
      [
        30,
        44
      ]
    ],
    "baseCentsPerKg": 490
  },
  {
    "id": "oat",
    "name": "Oat base",
    "familyId": "plant",
    "stage": 5,
    "roles": [
      "plant"
    ],
    "form": "powder",
    "storageClass": "dry",
    "shelfWeeks": 22,
    "gramsPerLiter": 580,
    "flavor": [
      1,
      1,
      5,
      0
    ],
    "cycleFactor": 1.02,
    "yieldFactor": 0.98,
    "harvest": [
      [
        28,
        40
      ]
    ],
    "baseCentsPerKg": 350
  },
  {
    "id": "coffee",
    "name": "Coffee preparation",
    "familyId": "coffee",
    "stage": 4,
    "roles": [
      "coffee"
    ],
    "form": "powder",
    "storageClass": "dry",
    "shelfWeeks": 16,
    "gramsPerLiter": 410,
    "flavor": [
      2,
      3,
      10,
      1
    ],
    "cycleFactor": 1.06,
    "yieldFactor": 0.96,
    "harvest": [
      [
        6,
        18
      ],
      [
        34,
        46
      ]
    ],
    "baseCentsPerKg": 2200
  },
  {
    "id": "salt",
    "name": "Finishing salt",
    "familyId": "salt",
    "stage": 1,
    "roles": [
      "salt"
    ],
    "form": "crystal",
    "storageClass": "dry",
    "shelfWeeks": 52,
    "gramsPerLiter": 1200,
    "flavor": [
      0,
      0,
      0,
      2
    ],
    "cycleFactor": 1,
    "yieldFactor": 1,
    "harvest": [
      [
        1,
        52
      ]
    ],
    "baseCentsPerKg": 190
  }
];
