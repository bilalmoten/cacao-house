import type {SupplierBusiness} from '../model.ts';
export const suppliers:SupplierBusiness[] = [
  {
    "id": "rafi",
    "name": "Rafi's Pantry",
    "cityId": "sf",
    "stage": 1,
    "remoteIntroduction": true,
    "varietyIds": [
      "cocoa-ecuador",
      "cocoa-ghana",
      "sugar-refined",
      "milk-powder",
      "salt",
      "vanilla"
    ],
    "leadWeeks": 0,
    "priceFactor": 1.22,
    "quality": 68,
    "minimumGrams": 1000,
    "baseAvailabilityGrams": 180000,
    "reliability": 0.99,
    "freightCents": 0,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ],
    "packagingIds": [
      "ordinary-wrap"
    ],
    "packagingAvailabilityUnits": 100000
  },
  {
    "id": "bay-import",
    "name": "Bay Origin Imports",
    "cityId": "sf",
    "stage": 1,
    "remoteIntroduction": true,
    "varietyIds": [
      "cocoa-ecuador",
      "cocoa-ghana",
      "cocoa-peru",
      "cocoa-madagascar",
      "cocoa-dominican",
      "cocoa-vietnam",
      "sugar-raw",
      "vanilla",
      "coffee",
      "berry"
    ],
    "leadWeeks": 2,
    "priceFactor": 1.08,
    "quality": 84,
    "minimumGrams": 10000,
    "baseAvailabilityGrams": 280000,
    "reliability": 0.94,
    "freightCents": 2800,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ]
  },
  {
    "id": "bay-bulk",
    "name": "Bay Area Domestic Wholesale",
    "cityId": "oakland",
    "stage": 1,
    "remoteIntroduction": true,
    "varietyIds": [
      "cocoa-ghana",
      "sugar-refined",
      "sugar-raw",
      "milk-powder",
      "cream-powder",
      "butter",
      "peanut",
      "crisp-rice",
      "wafer",
      "oat",
      "salt"
    ],
    "leadWeeks": 1,
    "priceFactor": 0.84,
    "quality": 66,
    "minimumGrams": 20000,
    "baseAvailabilityGrams": 1400000,
    "reliability": 0.98,
    "freightCents": 1600,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ],
    "packagingIds": [
      "ordinary-wrap",
      "presentation-box",
      "protective-pack"
    ],
    "packagingAvailabilityUnits": 100000
  },
  {
    "id": "industrial-foods",
    "name": "East Bay Production Foods",
    "cityId": "oakland",
    "stage": 3,
    "remoteIntroduction": false,
    "varietyIds": [
      "sugar-refined",
      "milk-powder",
      "cream-powder",
      "butter",
      "peanut",
      "almond",
      "wafer",
      "crisp-rice",
      "oat",
      "coconut",
      "coffee",
      "salt"
    ],
    "leadWeeks": 0,
    "priceFactor": 1.02,
    "quality": 75,
    "minimumGrams": 5000,
    "baseAvailabilityGrams": 750000,
    "reliability": 0.99,
    "freightCents": 900,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ]
  },
  {
    "id": "claire-imports",
    "name": "Claire's Collection Sources",
    "cityId": "paris",
    "stage": 2,
    "remoteIntroduction": false,
    "varietyIds": [
      "cocoa-peru",
      "cocoa-madagascar",
      "cocoa-dominican",
      "cream-powder",
      "vanilla",
      "berry",
      "hazelnut",
      "butter",
      "lemon-peel"
    ],
    "leadWeeks": 2,
    "priceFactor": 1.18,
    "quality": 91,
    "minimumGrams": 4000,
    "baseAvailabilityGrams": 180000,
    "reliability": 0.97,
    "freightCents": 3900,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ],
    "packagingIds": [
      "presentation-box"
    ],
    "packagingAvailabilityUnits": 100000
  },
  {
    "id": "maison-pantry",
    "name": "Maison Ingredient Exchange",
    "cityId": "paris",
    "stage": 2,
    "remoteIntroduction": false,
    "varietyIds": [
      "cocoa-ecuador",
      "cocoa-peru",
      "sugar-raw",
      "cream-powder",
      "orange-peel",
      "berry",
      "almond",
      "butter",
      "vanilla"
    ],
    "leadWeeks": 1,
    "priceFactor": 1.08,
    "quality": 82,
    "minimumGrams": 6000,
    "baseAvailabilityGrams": 300000,
    "reliability": 0.98,
    "freightCents": 2200,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ],
    "packagingIds": [
      "ordinary-wrap",
      "presentation-box"
    ],
    "packagingAvailabilityUnits": 100000
  },
  {
    "id": "luca-nuts",
    "name": "Luca's Roast Partnership",
    "cityId": "turin",
    "stage": 2,
    "remoteIntroduction": false,
    "varietyIds": [
      "hazelnut",
      "almond",
      "pistachio",
      "cashew",
      "pecan"
    ],
    "leadWeeks": 2,
    "priceFactor": 1.04,
    "quality": 89,
    "minimumGrams": 8000,
    "baseAvailabilityGrams": 300000,
    "reliability": 0.96,
    "freightCents": 1700,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ]
  },
  {
    "id": "turin-reserve",
    "name": "Turin Nut Reserve",
    "cityId": "turin",
    "stage": 2,
    "remoteIntroduction": false,
    "varietyIds": [
      "hazelnut",
      "almond",
      "pecan",
      "peanut",
      "milk-powder",
      "cream-powder",
      "wafer"
    ],
    "leadWeeks": 1,
    "priceFactor": 0.94,
    "quality": 78,
    "minimumGrams": 20000,
    "baseAvailabilityGrams": 650000,
    "reliability": 0.98,
    "freightCents": 2200,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ]
  },
  {
    "id": "guayas",
    "name": "Guayas Grower Partnership",
    "cityId": "guayaquil",
    "stage": 2,
    "remoteIntroduction": false,
    "varietyIds": [
      "cocoa-ecuador",
      "cocoa-peru",
      "passion-fruit",
      "mango",
      "panela"
    ],
    "leadWeeks": 3,
    "priceFactor": 0.82,
    "quality": 86,
    "minimumGrams": 30000,
    "baseAvailabilityGrams": 800000,
    "reliability": 0.92,
    "freightCents": 5400,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ]
  },
  {
    "id": "rio-export",
    "name": "Rio Export Cooperative",
    "cityId": "guayaquil",
    "stage": 2,
    "remoteIntroduction": false,
    "varietyIds": [
      "cocoa-ecuador",
      "cocoa-peru",
      "cocoa-brazil",
      "coconut",
      "sugar-raw",
      "passion-fruit",
      "orange-peel"
    ],
    "leadWeeks": 2,
    "priceFactor": 0.94,
    "quality": 78,
    "minimumGrams": 12000,
    "baseAvailabilityGrams": 550000,
    "reliability": 0.96,
    "freightCents": 3800,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ]
  },
  {
    "id": "aoi-tea",
    "name": "Aoi's Tea Studio",
    "cityId": "kyoto",
    "stage": 3,
    "remoteIntroduction": false,
    "varietyIds": [
      "matcha",
      "roasted-tea",
      "black-tea"
    ],
    "leadWeeks": 2,
    "priceFactor": 1.12,
    "quality": 93,
    "minimumGrams": 2000,
    "baseAvailabilityGrams": 80000,
    "reliability": 0.98,
    "freightCents": 1800,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ]
  },
  {
    "id": "uji-trade",
    "name": "Uji Tea Trade House",
    "cityId": "kyoto",
    "stage": 3,
    "remoteIntroduction": false,
    "varietyIds": [
      "matcha",
      "roasted-tea",
      "black-tea",
      "sugar-refined",
      "milk-powder"
    ],
    "leadWeeks": 3,
    "priceFactor": 0.86,
    "quality": 80,
    "minimumGrams": 10000,
    "baseAvailabilityGrams": 220000,
    "reliability": 0.95,
    "freightCents": 2700,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ],
    "packagingIds": [
      "ordinary-wrap",
      "presentation-box"
    ],
    "packagingAvailabilityUnits": 100000
  },
  {
    "id": "ximena-cocoa",
    "name": "Ximena's Cocoa Partnership",
    "cityId": "oaxaca",
    "stage": 2,
    "remoteIntroduction": false,
    "varietyIds": [
      "cocoa-mexico",
      "cinnamon",
      "panela",
      "vanilla",
      "sugar-raw",
      "cashew",
      "salt"
    ],
    "leadWeeks": 1,
    "priceFactor": 0.92,
    "quality": 85,
    "minimumGrams": 6000,
    "baseAvailabilityGrams": 210000,
    "reliability": 0.97,
    "freightCents": 1300,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ]
  },
  {
    "id": "mercado-trade",
    "name": "Mercado Ingredients",
    "cityId": "oaxaca",
    "stage": 2,
    "remoteIntroduction": false,
    "varietyIds": [
      "cocoa-mexico",
      "cinnamon",
      "panela",
      "sugar-refined",
      "orange-peel",
      "coffee"
    ],
    "leadWeeks": 0,
    "priceFactor": 1.18,
    "quality": 73,
    "minimumGrams": 2000,
    "baseAvailabilityGrams": 170000,
    "reliability": 0.99,
    "freightCents": 600,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ],
    "packagingIds": [
      "ordinary-wrap",
      "presentation-box"
    ],
    "packagingAvailabilityUnits": 100000
  },
  {
    "id": "marisa-fruit",
    "name": "Marisa's Fruit & Cocoa",
    "cityId": "salvador",
    "stage": 3,
    "remoteIntroduction": false,
    "varietyIds": [
      "cocoa-brazil",
      "coconut",
      "passion-fruit",
      "mango",
      "cashew",
      "coffee"
    ],
    "leadWeeks": 2,
    "priceFactor": 0.9,
    "quality": 86,
    "minimumGrams": 10000,
    "baseAvailabilityGrams": 460000,
    "reliability": 0.95,
    "freightCents": 3300,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ]
  },
  {
    "id": "atlantic-trade",
    "name": "Atlantic Cold Route",
    "cityId": "salvador",
    "stage": 3,
    "remoteIntroduction": false,
    "varietyIds": [
      "cocoa-brazil",
      "coconut",
      "passion-fruit",
      "mango",
      "sugar-raw",
      "salt"
    ],
    "leadWeeks": 1,
    "priceFactor": 1.13,
    "quality": 90,
    "minimumGrams": 4000,
    "baseAvailabilityGrams": 260000,
    "reliability": 0.98,
    "freightCents": 4100,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ],
    "packagingIds": [
      "ordinary-wrap",
      "protective-pack"
    ],
    "packagingAvailabilityUnits": 100000
  },
  {
    "id": "deniz-gifts",
    "name": "Deniz's Gift Ingredients",
    "cityId": "istanbul",
    "stage": 4,
    "remoteIntroduction": false,
    "varietyIds": [
      "pistachio",
      "almond",
      "hazelnut",
      "cardamom",
      "vanilla",
      "black-tea",
      "orange-peel",
      "lemon-peel"
    ],
    "leadWeeks": 1,
    "priceFactor": 1.12,
    "quality": 88,
    "minimumGrams": 5000,
    "baseAvailabilityGrams": 250000,
    "reliability": 0.98,
    "freightCents": 1800,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ],
    "packagingIds": [
      "ordinary-wrap",
      "presentation-box"
    ],
    "packagingAvailabilityUnits": 200000
  },
  {
    "id": "bosphorus-bulk",
    "name": "Bosphorus Nut & Spice Exchange",
    "cityId": "istanbul",
    "stage": 4,
    "remoteIntroduction": false,
    "varietyIds": [
      "pistachio",
      "almond",
      "cardamom",
      "cinnamon",
      "black-tea",
      "lemon-peel"
    ],
    "leadWeeks": 3,
    "priceFactor": 0.85,
    "quality": 78,
    "minimumGrams": 25000,
    "baseAvailabilityGrams": 800000,
    "reliability": 0.94,
    "freightCents": 3200,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ]
  },
  {
    "id": "priya-spice",
    "name": "Priya's Spice & Fruit",
    "cityId": "mumbai",
    "stage": 4,
    "remoteIntroduction": false,
    "varietyIds": [
      "cardamom",
      "cinnamon",
      "mango",
      "cashew",
      "coffee",
      "coconut"
    ],
    "leadWeeks": 1,
    "priceFactor": 1.04,
    "quality": 88,
    "minimumGrams": 5000,
    "baseAvailabilityGrams": 360000,
    "reliability": 0.96,
    "freightCents": 1800,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ]
  },
  {
    "id": "western-pantry",
    "name": "Western Pantry Logistics",
    "cityId": "mumbai",
    "stage": 4,
    "remoteIntroduction": false,
    "varietyIds": [
      "cardamom",
      "cinnamon",
      "mango",
      "cashew",
      "peanut",
      "oat",
      "sugar-refined"
    ],
    "leadWeeks": 2,
    "priceFactor": 0.82,
    "quality": 74,
    "minimumGrams": 30000,
    "baseAvailabilityGrams": 900000,
    "reliability": 0.95,
    "freightCents": 2700,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ],
    "packagingIds": [
      "ordinary-wrap",
      "protective-pack"
    ],
    "packagingAvailabilityUnits": 200000
  },
  {
    "id": "kofi-cocoa",
    "name": "Kofi's Cocoa Partnership",
    "cityId": "accra",
    "stage": 5,
    "remoteIntroduction": false,
    "varietyIds": [
      "cocoa-ghana",
      "cocoa-dominican",
      "peanut",
      "sugar-raw"
    ],
    "leadWeeks": 3,
    "priceFactor": 0.72,
    "quality": 82,
    "minimumGrams": 60000,
    "baseAvailabilityGrams": 2200000,
    "reliability": 0.98,
    "freightCents": 6200,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ]
  },
  {
    "id": "accra-specialty",
    "name": "Accra Specialty Trade",
    "cityId": "accra",
    "stage": 5,
    "remoteIntroduction": false,
    "varietyIds": [
      "cocoa-ghana",
      "cocoa-dominican",
      "cocoa-madagascar",
      "vanilla",
      "coconut"
    ],
    "leadWeeks": 2,
    "priceFactor": 1.07,
    "quality": 92,
    "minimumGrams": 12000,
    "baseAvailabilityGrams": 380000,
    "reliability": 0.96,
    "freightCents": 4300,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ],
    "packagingIds": [
      "ordinary-wrap",
      "protective-pack"
    ],
    "packagingAvailabilityUnits": 200000
  },
  {
    "id": "mei-origins",
    "name": "Mei's Origin Trade Desk",
    "cityId": "singapore",
    "stage": 6,
    "remoteIntroduction": false,
    "varietyIds": [
      "cocoa-vietnam",
      "cocoa-madagascar",
      "cocoa-peru",
      "matcha",
      "berry",
      "coffee",
      "pecan"
    ],
    "leadWeeks": 2,
    "priceFactor": 1.01,
    "quality": 90,
    "minimumGrams": 10000,
    "baseAvailabilityGrams": 450000,
    "reliability": 0.98,
    "freightCents": 3100,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ]
  },
  {
    "id": "straits-hub",
    "name": "Straits Regional Supply Hub",
    "cityId": "singapore",
    "stage": 6,
    "remoteIntroduction": false,
    "varietyIds": [
      "cocoa-vietnam",
      "cocoa-dominican",
      "cocoa-brazil",
      "cream-powder",
      "berry",
      "oat",
      "wafer",
      "crisp-rice"
    ],
    "leadWeeks": 1,
    "priceFactor": 0.91,
    "quality": 82,
    "minimumGrams": 35000,
    "baseAvailabilityGrams": 1300000,
    "reliability": 0.99,
    "freightCents": 2500,
    "bulkBands": [
      {
        "grams": 50000,
        "discount": 0.04
      },
      {
        "grams": 200000,
        "discount": 0.09
      },
      {
        "grams": 600000,
        "discount": 0.14
      }
    ],
    "packagingIds": [
      "ordinary-wrap",
      "presentation-box",
      "protective-pack"
    ],
    "packagingAvailabilityUnits": 200000
  }
];
