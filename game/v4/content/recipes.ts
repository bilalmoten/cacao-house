import type {CommercialRecipe} from '../model.ts';
export const recipes:CommercialRecipe[] = [
  {
    "id": "embar62",
    "name": "Embarcadero 62",
    "stage": 1,
    "line": "solid-bars",
    "route": "solid",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana"
        ],
        "gramsPerCase": 800,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined"
        ],
        "gramsPerCase": 400,
        "qualityWeight": 1,
        "minimumQuality": 45
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 2,
        "laborMinutesPerCase": 1
      },
      {
        "station": "processing",
        "minutesPerCase": 3,
        "laborMinutesPerCase": 2
      },
      {
        "station": "tempering",
        "minutesPerCase": 4,
        "laborMinutesPerCase": 2
      },
      {
        "station": "cooling",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 1
      },
      {
        "station": "packing",
        "minutesPerCase": 3,
        "laborMinutesPerCase": 2
      }
    ],
    "referencePriceCents": 2000,
    "shelfWeeks": 4,
    "storageClass": "controlled",
    "flavor": [
      8,
      3,
      3,
      1
    ],
    "researchBudgetCents": 0,
    "minimumShelfWeeks": 4
  },
  {
    "id": "velvet-milk",
    "name": "Velvet Milk",
    "stage": 1,
    "line": "solid-bars",
    "route": "solid",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana"
        ],
        "gramsPerCase": 550,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined"
        ],
        "gramsPerCase": 400,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "dairy",
        "allowedVarietyIds": [
          "milk-powder"
        ],
        "gramsPerCase": 300,
        "qualityWeight": 2,
        "minimumQuality": 55
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 2.5,
        "laborMinutesPerCase": 1
      },
      {
        "station": "processing",
        "minutesPerCase": 3.5,
        "laborMinutesPerCase": 2
      },
      {
        "station": "tempering",
        "minutesPerCase": 4.5,
        "laborMinutesPerCase": 2
      },
      {
        "station": "cooling",
        "minutesPerCase": 7.5,
        "laborMinutesPerCase": 1
      },
      {
        "station": "packing",
        "minutesPerCase": 3.5,
        "laborMinutesPerCase": 2
      }
    ],
    "referencePriceCents": 2200,
    "shelfWeeks": 4,
    "storageClass": "controlled",
    "flavor": [
      5,
      2,
      3,
      1
    ],
    "researchBudgetCents": 0,
    "minimumShelfWeeks": 4
  },
  {
    "id": "origin-collection",
    "name": "Origin Collection",
    "stage": 2,
    "line": "solid-bars",
    "route": "solid",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-mexico",
          "cocoa-peru"
        ],
        "gramsPerCase": 1000,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 200,
        "qualityWeight": 1,
        "minimumQuality": 45
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 3,
        "laborMinutesPerCase": 1
      },
      {
        "station": "processing",
        "minutesPerCase": 4,
        "laborMinutesPerCase": 2
      },
      {
        "station": "tempering",
        "minutesPerCase": 5,
        "laborMinutesPerCase": 2
      },
      {
        "station": "cooling",
        "minutesPerCase": 8,
        "laborMinutesPerCase": 1
      },
      {
        "station": "packing",
        "minutesPerCase": 4,
        "laborMinutesPerCase": 2
      }
    ],
    "referencePriceCents": 3800,
    "shelfWeeks": 5,
    "storageClass": "controlled",
    "flavor": [
      9,
      7,
      2,
      1
    ],
    "researchBudgetCents": 180000,
    "minimumShelfWeeks": 5
  },
  {
    "id": "amber-peel",
    "name": "Amber Peel",
    "stage": 2,
    "line": "inclusion-bars",
    "route": "inclusion",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-mexico",
          "cocoa-peru"
        ],
        "gramsPerCase": 700,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 350,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "fruit",
        "allowedVarietyIds": [
          "orange-peel"
        ],
        "gramsPerCase": 250,
        "qualityWeight": 3,
        "minimumQuality": 60
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 4,
        "laborMinutesPerCase": 3
      },
      {
        "station": "processing",
        "minutesPerCase": 4,
        "laborMinutesPerCase": 2
      },
      {
        "station": "tempering",
        "minutesPerCase": 4,
        "laborMinutesPerCase": 2
      },
      {
        "station": "cooling",
        "minutesPerCase": 8,
        "laborMinutesPerCase": 1
      },
      {
        "station": "packing",
        "minutesPerCase": 4,
        "laborMinutesPerCase": 3
      }
    ],
    "referencePriceCents": 2800,
    "shelfWeeks": 4,
    "storageClass": "controlled",
    "flavor": [
      6,
      9,
      2,
      1
    ],
    "researchBudgetCents": 180000,
    "minimumShelfWeeks": 4
  },
  {
    "id": "pistachio-crunch",
    "name": "Pistachio Crunch",
    "stage": 3,
    "line": "inclusion-bars",
    "route": "inclusion",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru"
        ],
        "gramsPerCase": 600,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 300,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "nut",
        "allowedVarietyIds": [
          "pistachio"
        ],
        "gramsPerCase": 280,
        "qualityWeight": 3,
        "minimumQuality": 60
      },
      {
        "role": "grain",
        "allowedVarietyIds": [
          "crisp-rice"
        ],
        "gramsPerCase": 120,
        "qualityWeight": 2,
        "minimumQuality": 50
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 4.5,
        "laborMinutesPerCase": 3
      },
      {
        "station": "processing",
        "minutesPerCase": 4.5,
        "laborMinutesPerCase": 2
      },
      {
        "station": "tempering",
        "minutesPerCase": 4.5,
        "laborMinutesPerCase": 2
      },
      {
        "station": "cooling",
        "minutesPerCase": 8.5,
        "laborMinutesPerCase": 1
      },
      {
        "station": "packing",
        "minutesPerCase": 4.5,
        "laborMinutesPerCase": 3
      }
    ],
    "referencePriceCents": 4400,
    "shelfWeeks": 3,
    "storageClass": "controlled",
    "flavor": [
      5,
      3,
      8,
      1
    ],
    "researchBudgetCents": 400000,
    "minimumShelfWeeks": 3
  },
  {
    "id": "spiced-coffee",
    "name": "Spiced Coffee Bar",
    "stage": 4,
    "line": "inclusion-bars",
    "route": "inclusion",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar"
        ],
        "gramsPerCase": 700,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 350,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "coffee",
        "allowedVarietyIds": [
          "coffee"
        ],
        "gramsPerCase": 80,
        "qualityWeight": 3,
        "minimumQuality": 60
      },
      {
        "role": "spice",
        "allowedVarietyIds": [
          "cinnamon",
          "cardamom"
        ],
        "gramsPerCase": 15,
        "qualityWeight": 2,
        "minimumQuality": 55
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 5,
        "laborMinutesPerCase": 3
      },
      {
        "station": "processing",
        "minutesPerCase": 5,
        "laborMinutesPerCase": 2
      },
      {
        "station": "tempering",
        "minutesPerCase": 5,
        "laborMinutesPerCase": 2
      },
      {
        "station": "cooling",
        "minutesPerCase": 9,
        "laborMinutesPerCase": 1
      },
      {
        "station": "packing",
        "minutesPerCase": 5,
        "laborMinutesPerCase": 3
      }
    ],
    "referencePriceCents": 4200,
    "shelfWeeks": 4,
    "storageClass": "controlled",
    "flavor": [
      6,
      2,
      9,
      7
    ],
    "researchBudgetCents": 650000,
    "minimumShelfWeeks": 4
  },
  {
    "id": "copper-praline",
    "name": "Copper Praline",
    "stage": 2,
    "line": "nut-centres",
    "route": "nut-fill",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-mexico",
          "cocoa-peru"
        ],
        "gramsPerCase": 550,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 350,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "nut",
        "allowedVarietyIds": [
          "hazelnut"
        ],
        "gramsPerCase": 400,
        "qualityWeight": 3,
        "minimumQuality": 60
      },
      {
        "role": "dairy",
        "allowedVarietyIds": [
          "milk-powder"
        ],
        "gramsPerCase": 100,
        "qualityWeight": 2,
        "minimumQuality": 55
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 5
      },
      {
        "station": "processing",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 4
      },
      {
        "station": "tempering",
        "minutesPerCase": 5,
        "laborMinutesPerCase": 3
      },
      {
        "station": "cooling",
        "minutesPerCase": 9,
        "laborMinutesPerCase": 1
      },
      {
        "station": "packing",
        "minutesPerCase": 6,
        "laborMinutesPerCase": 4
      }
    ],
    "referencePriceCents": 3400,
    "shelfWeeks": 3,
    "storageClass": "controlled",
    "flavor": [
      6,
      2,
      9,
      1
    ],
    "researchBudgetCents": 180000,
    "minimumShelfWeeks": 3
  },
  {
    "id": "gianduja",
    "name": "Gianduja Reserve",
    "stage": 2,
    "line": "nut-centres",
    "route": "nut-fill",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-mexico",
          "cocoa-peru"
        ],
        "gramsPerCase": 600,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 250,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "nut",
        "allowedVarietyIds": [
          "hazelnut"
        ],
        "gramsPerCase": 500,
        "qualityWeight": 3,
        "minimumQuality": 60
      },
      {
        "role": "dairy",
        "allowedVarietyIds": [
          "milk-powder"
        ],
        "gramsPerCase": 80,
        "qualityWeight": 2,
        "minimumQuality": 55
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 7.5,
        "laborMinutesPerCase": 5
      },
      {
        "station": "processing",
        "minutesPerCase": 7.5,
        "laborMinutesPerCase": 4
      },
      {
        "station": "tempering",
        "minutesPerCase": 5.5,
        "laborMinutesPerCase": 3
      },
      {
        "station": "cooling",
        "minutesPerCase": 9.5,
        "laborMinutesPerCase": 1
      },
      {
        "station": "packing",
        "minutesPerCase": 6.5,
        "laborMinutesPerCase": 4
      }
    ],
    "referencePriceCents": 4200,
    "shelfWeeks": 3,
    "storageClass": "controlled",
    "flavor": [
      7,
      2,
      10,
      1
    ],
    "researchBudgetCents": 180000,
    "minimumShelfWeeks": 3
  },
  {
    "id": "cashew-coconut",
    "name": "Cashew Coconut Centre",
    "stage": 3,
    "line": "nut-centres",
    "route": "nut-fill",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru"
        ],
        "gramsPerCase": 500,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 300,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "nut",
        "allowedVarietyIds": [
          "cashew"
        ],
        "gramsPerCase": 350,
        "qualityWeight": 3,
        "minimumQuality": 60
      },
      {
        "role": "plant",
        "allowedVarietyIds": [
          "coconut"
        ],
        "gramsPerCase": 200,
        "qualityWeight": 2,
        "minimumQuality": 55
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 8,
        "laborMinutesPerCase": 5
      },
      {
        "station": "processing",
        "minutesPerCase": 8,
        "laborMinutesPerCase": 4
      },
      {
        "station": "tempering",
        "minutesPerCase": 6,
        "laborMinutesPerCase": 3
      },
      {
        "station": "cooling",
        "minutesPerCase": 10,
        "laborMinutesPerCase": 1
      },
      {
        "station": "packing",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 4
      }
    ],
    "referencePriceCents": 3900,
    "shelfWeeks": 3,
    "storageClass": "controlled",
    "flavor": [
      5,
      4,
      7,
      2
    ],
    "researchBudgetCents": 400000,
    "minimumShelfWeeks": 3
  },
  {
    "id": "midnight-ganache",
    "name": "Midnight Ganache",
    "stage": 3,
    "line": "ganache",
    "route": "wet-fill",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru"
        ],
        "gramsPerCase": 700,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 250,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "cream",
        "allowedVarietyIds": [
          "cream-powder"
        ],
        "gramsPerCase": 300,
        "qualityWeight": 3,
        "minimumQuality": 60
      },
      {
        "role": "spice",
        "allowedVarietyIds": [
          "vanilla"
        ],
        "gramsPerCase": 8,
        "qualityWeight": 2,
        "minimumQuality": 55
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 6,
        "laborMinutesPerCase": 4
      },
      {
        "station": "processing",
        "minutesPerCase": 10,
        "laborMinutesPerCase": 6
      },
      {
        "station": "tempering",
        "minutesPerCase": 6,
        "laborMinutesPerCase": 3
      },
      {
        "station": "cooling",
        "minutesPerCase": 12,
        "laborMinutesPerCase": 2
      },
      {
        "station": "packing",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 5
      }
    ],
    "referencePriceCents": 4800,
    "shelfWeeks": 1,
    "storageClass": "cold",
    "flavor": [
      9,
      3,
      3,
      1
    ],
    "researchBudgetCents": 400000,
    "minimumShelfWeeks": 1
  },
  {
    "id": "kyoto-tea-cream",
    "name": "Kyoto Tea Cream",
    "stage": 3,
    "line": "ganache",
    "route": "wet-fill",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru"
        ],
        "gramsPerCase": 550,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 300,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "cream",
        "allowedVarietyIds": [
          "cream-powder"
        ],
        "gramsPerCase": 280,
        "qualityWeight": 3,
        "minimumQuality": 60
      },
      {
        "role": "tea",
        "allowedVarietyIds": [
          "matcha",
          "roasted-tea",
          "black-tea"
        ],
        "gramsPerCase": 35,
        "qualityWeight": 4,
        "minimumQuality": 65
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 6.5,
        "laborMinutesPerCase": 4
      },
      {
        "station": "processing",
        "minutesPerCase": 10.5,
        "laborMinutesPerCase": 6
      },
      {
        "station": "tempering",
        "minutesPerCase": 6.5,
        "laborMinutesPerCase": 3
      },
      {
        "station": "cooling",
        "minutesPerCase": 12.5,
        "laborMinutesPerCase": 2
      },
      {
        "station": "packing",
        "minutesPerCase": 7.5,
        "laborMinutesPerCase": 5
      }
    ],
    "referencePriceCents": 5200,
    "shelfWeeks": 1,
    "storageClass": "cold",
    "flavor": [
      5,
      4,
      5,
      3
    ],
    "researchBudgetCents": 400000,
    "minimumShelfWeeks": 1
  },
  {
    "id": "passion-ganache",
    "name": "Passion Fruit Ganache",
    "stage": 4,
    "line": "ganache",
    "route": "wet-fill",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar"
        ],
        "gramsPerCase": 550,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 300,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "cream",
        "allowedVarietyIds": [
          "cream-powder"
        ],
        "gramsPerCase": 200,
        "qualityWeight": 3,
        "minimumQuality": 60
      },
      {
        "role": "fruit",
        "allowedVarietyIds": [
          "passion-fruit",
          "mango"
        ],
        "gramsPerCase": 250,
        "qualityWeight": 3,
        "minimumQuality": 60
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 4
      },
      {
        "station": "processing",
        "minutesPerCase": 11,
        "laborMinutesPerCase": 6
      },
      {
        "station": "tempering",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 3
      },
      {
        "station": "cooling",
        "minutesPerCase": 13,
        "laborMinutesPerCase": 2
      },
      {
        "station": "packing",
        "minutesPerCase": 8,
        "laborMinutesPerCase": 5
      }
    ],
    "referencePriceCents": 5400,
    "shelfWeeks": 1,
    "storageClass": "cold",
    "flavor": [
      5,
      10,
      2,
      1
    ],
    "researchBudgetCents": 650000,
    "minimumShelfWeeks": 1
  },
  {
    "id": "salted-caramel",
    "name": "Salted Caramel Bonbon",
    "stage": 4,
    "line": "caramel",
    "route": "wet-fill",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar"
        ],
        "gramsPerCase": 450,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 500,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "fat",
        "allowedVarietyIds": [
          "butter"
        ],
        "gramsPerCase": 150,
        "qualityWeight": 2,
        "minimumQuality": 55
      },
      {
        "role": "salt",
        "allowedVarietyIds": [
          "salt"
        ],
        "gramsPerCase": 8,
        "qualityWeight": 1,
        "minimumQuality": 45
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 6,
        "laborMinutesPerCase": 4
      },
      {
        "station": "processing",
        "minutesPerCase": 10,
        "laborMinutesPerCase": 6
      },
      {
        "station": "tempering",
        "minutesPerCase": 6,
        "laborMinutesPerCase": 3
      },
      {
        "station": "cooling",
        "minutesPerCase": 12,
        "laborMinutesPerCase": 2
      },
      {
        "station": "packing",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 5
      }
    ],
    "referencePriceCents": 4500,
    "shelfWeeks": 2,
    "storageClass": "controlled",
    "flavor": [
      5,
      1,
      7,
      2
    ],
    "researchBudgetCents": 650000,
    "minimumShelfWeeks": 2
  },
  {
    "id": "cardamom-caramel",
    "name": "Cardamom Caramel",
    "stage": 4,
    "line": "caramel",
    "route": "wet-fill",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar"
        ],
        "gramsPerCase": 450,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 450,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "fat",
        "allowedVarietyIds": [
          "butter"
        ],
        "gramsPerCase": 150,
        "qualityWeight": 2,
        "minimumQuality": 55
      },
      {
        "role": "spice",
        "allowedVarietyIds": [
          "cardamom"
        ],
        "gramsPerCase": 15,
        "qualityWeight": 2,
        "minimumQuality": 55
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 6.5,
        "laborMinutesPerCase": 4
      },
      {
        "station": "processing",
        "minutesPerCase": 10.5,
        "laborMinutesPerCase": 6
      },
      {
        "station": "tempering",
        "minutesPerCase": 6.5,
        "laborMinutesPerCase": 3
      },
      {
        "station": "cooling",
        "minutesPerCase": 12.5,
        "laborMinutesPerCase": 2
      },
      {
        "station": "packing",
        "minutesPerCase": 7.5,
        "laborMinutesPerCase": 5
      }
    ],
    "referencePriceCents": 4900,
    "shelfWeeks": 2,
    "storageClass": "controlled",
    "flavor": [
      5,
      3,
      6,
      9
    ],
    "researchBudgetCents": 650000,
    "minimumShelfWeeks": 2
  },
  {
    "id": "coffee-caramel",
    "name": "Coffee Caramel",
    "stage": 5,
    "line": "caramel",
    "route": "wet-fill",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar",
          "cocoa-dominican"
        ],
        "gramsPerCase": 450,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 450,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "fat",
        "allowedVarietyIds": [
          "butter"
        ],
        "gramsPerCase": 150,
        "qualityWeight": 2,
        "minimumQuality": 55
      },
      {
        "role": "coffee",
        "allowedVarietyIds": [
          "coffee"
        ],
        "gramsPerCase": 65,
        "qualityWeight": 3,
        "minimumQuality": 60
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 4
      },
      {
        "station": "processing",
        "minutesPerCase": 11,
        "laborMinutesPerCase": 6
      },
      {
        "station": "tempering",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 3
      },
      {
        "station": "cooling",
        "minutesPerCase": 13,
        "laborMinutesPerCase": 2
      },
      {
        "station": "packing",
        "minutesPerCase": 8,
        "laborMinutesPerCase": 5
      }
    ],
    "referencePriceCents": 4800,
    "shelfWeeks": 2,
    "storageClass": "controlled",
    "flavor": [
      6,
      2,
      10,
      1
    ],
    "researchBudgetCents": 950000,
    "minimumShelfWeeks": 2
  },
  {
    "id": "biscuit-bites",
    "name": "Biscuit Bites",
    "stage": 4,
    "line": "enrobed",
    "route": "enrobe",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar"
        ],
        "gramsPerCase": 550,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 250,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "grain",
        "allowedVarietyIds": [
          "wafer"
        ],
        "gramsPerCase": 350,
        "qualityWeight": 2,
        "minimumQuality": 50
      },
      {
        "role": "nut",
        "allowedVarietyIds": [
          "peanut",
          "almond"
        ],
        "gramsPerCase": 100,
        "qualityWeight": 3,
        "minimumQuality": 60
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 5
      },
      {
        "station": "processing",
        "minutesPerCase": 8,
        "laborMinutesPerCase": 4
      },
      {
        "station": "tempering",
        "minutesPerCase": 6,
        "laborMinutesPerCase": 3
      },
      {
        "station": "cooling",
        "minutesPerCase": 10,
        "laborMinutesPerCase": 2
      },
      {
        "station": "packing",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 5
      }
    ],
    "referencePriceCents": 3400,
    "shelfWeeks": 3,
    "storageClass": "controlled",
    "flavor": [
      5,
      1,
      7,
      0
    ],
    "researchBudgetCents": 650000,
    "minimumShelfWeeks": 3
  },
  {
    "id": "citrus-jellies",
    "name": "Citrus Fruit Jellies",
    "stage": 5,
    "line": "enrobed",
    "route": "enrobe",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar",
          "cocoa-dominican"
        ],
        "gramsPerCase": 450,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 450,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "fruit",
        "allowedVarietyIds": [
          "orange-peel",
          "lemon-peel"
        ],
        "gramsPerCase": 300,
        "qualityWeight": 3,
        "minimumQuality": 60
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 7.5,
        "laborMinutesPerCase": 5
      },
      {
        "station": "processing",
        "minutesPerCase": 8.5,
        "laborMinutesPerCase": 4
      },
      {
        "station": "tempering",
        "minutesPerCase": 6.5,
        "laborMinutesPerCase": 3
      },
      {
        "station": "cooling",
        "minutesPerCase": 10.5,
        "laborMinutesPerCase": 2
      },
      {
        "station": "packing",
        "minutesPerCase": 7.5,
        "laborMinutesPerCase": 5
      }
    ],
    "referencePriceCents": 4800,
    "shelfWeeks": 2,
    "storageClass": "controlled",
    "flavor": [
      3,
      10,
      1,
      2
    ],
    "researchBudgetCents": 950000,
    "minimumShelfWeeks": 2
  },
  {
    "id": "pecan-bites",
    "name": "Pecan Crunch Bites",
    "stage": 5,
    "line": "enrobed",
    "route": "enrobe",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar",
          "cocoa-dominican"
        ],
        "gramsPerCase": 500,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 300,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "nut",
        "allowedVarietyIds": [
          "pecan"
        ],
        "gramsPerCase": 400,
        "qualityWeight": 3,
        "minimumQuality": 60
      },
      {
        "role": "grain",
        "allowedVarietyIds": [
          "crisp-rice"
        ],
        "gramsPerCase": 100,
        "qualityWeight": 2,
        "minimumQuality": 50
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 8,
        "laborMinutesPerCase": 5
      },
      {
        "station": "processing",
        "minutesPerCase": 9,
        "laborMinutesPerCase": 4
      },
      {
        "station": "tempering",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 3
      },
      {
        "station": "cooling",
        "minutesPerCase": 11,
        "laborMinutesPerCase": 2
      },
      {
        "station": "packing",
        "minutesPerCase": 8,
        "laborMinutesPerCase": 5
      }
    ],
    "referencePriceCents": 5300,
    "shelfWeeks": 3,
    "storageClass": "controlled",
    "flavor": [
      5,
      2,
      10,
      3
    ],
    "researchBudgetCents": 950000,
    "minimumShelfWeeks": 3
  },
  {
    "id": "coconut-dark",
    "name": "Coconut Dark",
    "stage": 4,
    "line": "plant-based",
    "route": "solid",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar"
        ],
        "gramsPerCase": 700,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 300,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "plant",
        "allowedVarietyIds": [
          "coconut"
        ],
        "gramsPerCase": 250,
        "qualityWeight": 2,
        "minimumQuality": 55
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 2,
        "laborMinutesPerCase": 1
      },
      {
        "station": "processing",
        "minutesPerCase": 3,
        "laborMinutesPerCase": 2
      },
      {
        "station": "tempering",
        "minutesPerCase": 4,
        "laborMinutesPerCase": 2
      },
      {
        "station": "cooling",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 1
      },
      {
        "station": "packing",
        "minutesPerCase": 3,
        "laborMinutesPerCase": 2
      }
    ],
    "referencePriceCents": 3600,
    "shelfWeeks": 4,
    "storageClass": "controlled",
    "flavor": [
      7,
      5,
      3,
      1
    ],
    "researchBudgetCents": 650000,
    "minimumShelfWeeks": 4
  },
  {
    "id": "oat-milk",
    "name": "Oat Milk Bar",
    "stage": 5,
    "line": "plant-based",
    "route": "solid",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar",
          "cocoa-dominican"
        ],
        "gramsPerCase": 600,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 350,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "plant",
        "allowedVarietyIds": [
          "oat"
        ],
        "gramsPerCase": 280,
        "qualityWeight": 2,
        "minimumQuality": 55
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 2.5,
        "laborMinutesPerCase": 1
      },
      {
        "station": "processing",
        "minutesPerCase": 3.5,
        "laborMinutesPerCase": 2
      },
      {
        "station": "tempering",
        "minutesPerCase": 4.5,
        "laborMinutesPerCase": 2
      },
      {
        "station": "cooling",
        "minutesPerCase": 7.5,
        "laborMinutesPerCase": 1
      },
      {
        "station": "packing",
        "minutesPerCase": 3.5,
        "laborMinutesPerCase": 2
      }
    ],
    "referencePriceCents": 3500,
    "shelfWeeks": 4,
    "storageClass": "controlled",
    "flavor": [
      5,
      2,
      6,
      0
    ],
    "researchBudgetCents": 950000,
    "minimumShelfWeeks": 4
  },
  {
    "id": "almond-berry",
    "name": "Almond Berry Bite",
    "stage": 6,
    "line": "plant-based",
    "route": "enrobe",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar",
          "cocoa-dominican",
          "cocoa-vietnam"
        ],
        "gramsPerCase": 450,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 300,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "nut",
        "allowedVarietyIds": [
          "almond"
        ],
        "gramsPerCase": 300,
        "qualityWeight": 3,
        "minimumQuality": 60
      },
      {
        "role": "fruit",
        "allowedVarietyIds": [
          "berry"
        ],
        "gramsPerCase": 220,
        "qualityWeight": 3,
        "minimumQuality": 60
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 8,
        "laborMinutesPerCase": 5
      },
      {
        "station": "processing",
        "minutesPerCase": 9,
        "laborMinutesPerCase": 4
      },
      {
        "station": "tempering",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 3
      },
      {
        "station": "cooling",
        "minutesPerCase": 11,
        "laborMinutesPerCase": 2
      },
      {
        "station": "packing",
        "minutesPerCase": 8,
        "laborMinutesPerCase": 5
      }
    ],
    "referencePriceCents": 5700,
    "shelfWeeks": 1,
    "storageClass": "cold",
    "flavor": [
      4,
      9,
      6,
      1
    ],
    "researchBudgetCents": 1500000,
    "minimumShelfWeeks": 1
  },
  {
    "id": "classic-drinking",
    "name": "Classic Drinking Chocolate",
    "stage": 6,
    "line": "drinking",
    "route": "dry-blend",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar",
          "cocoa-dominican",
          "cocoa-vietnam"
        ],
        "gramsPerCase": 420,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 180,
        "qualityWeight": 1,
        "minimumQuality": 45
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 4,
        "laborMinutesPerCase": 3
      },
      {
        "station": "processing",
        "minutesPerCase": 6,
        "laborMinutesPerCase": 3
      },
      {
        "station": "packing",
        "minutesPerCase": 5,
        "laborMinutesPerCase": 4
      }
    ],
    "referencePriceCents": 2800,
    "shelfWeeks": 12,
    "storageClass": "dry",
    "flavor": [
      9,
      1,
      3,
      0
    ],
    "researchBudgetCents": 1500000,
    "minimumShelfWeeks": 12
  },
  {
    "id": "spiced-blend",
    "name": "Spiced Cocoa Blend",
    "stage": 6,
    "line": "drinking",
    "route": "dry-blend",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar",
          "cocoa-dominican",
          "cocoa-vietnam"
        ],
        "gramsPerCase": 400,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 180,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "spice",
        "allowedVarietyIds": [
          "cinnamon",
          "cardamom"
        ],
        "gramsPerCase": 20,
        "qualityWeight": 2,
        "minimumQuality": 55
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 4.5,
        "laborMinutesPerCase": 3
      },
      {
        "station": "processing",
        "minutesPerCase": 6.5,
        "laborMinutesPerCase": 3
      },
      {
        "station": "packing",
        "minutesPerCase": 5.5,
        "laborMinutesPerCase": 4
      }
    ],
    "referencePriceCents": 3400,
    "shelfWeeks": 12,
    "storageClass": "dry",
    "flavor": [
      7,
      2,
      4,
      9
    ],
    "researchBudgetCents": 1500000,
    "minimumShelfWeeks": 12
  },
  {
    "id": "mocha",
    "name": "Mocha Mix",
    "stage": 6,
    "line": "drinking",
    "route": "dry-blend",
    "roles": [
      {
        "role": "cocoa",
        "allowedVarietyIds": [
          "cocoa-ecuador",
          "cocoa-ghana",
          "cocoa-brazil",
          "cocoa-mexico",
          "cocoa-peru",
          "cocoa-madagascar",
          "cocoa-dominican",
          "cocoa-vietnam"
        ],
        "gramsPerCase": 350,
        "qualityWeight": 4,
        "minimumQuality": 60
      },
      {
        "role": "sweetener",
        "allowedVarietyIds": [
          "sugar-refined",
          "sugar-raw",
          "panela"
        ],
        "gramsPerCase": 180,
        "qualityWeight": 1,
        "minimumQuality": 45
      },
      {
        "role": "coffee",
        "allowedVarietyIds": [
          "coffee"
        ],
        "gramsPerCase": 70,
        "qualityWeight": 3,
        "minimumQuality": 60
      }
    ],
    "operations": [
      {
        "station": "preparation",
        "minutesPerCase": 5,
        "laborMinutesPerCase": 3
      },
      {
        "station": "processing",
        "minutesPerCase": 7,
        "laborMinutesPerCase": 3
      },
      {
        "station": "packing",
        "minutesPerCase": 6,
        "laborMinutesPerCase": 4
      }
    ],
    "referencePriceCents": 3600,
    "shelfWeeks": 10,
    "storageClass": "dry",
    "flavor": [
      7,
      2,
      10,
      1
    ],
    "researchBudgetCents": 1500000,
    "minimumShelfWeeks": 10
  }
];
