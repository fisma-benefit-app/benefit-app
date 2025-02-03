# Refactor demo

dokumentti koskee committeja: [fa4b4aa](https://github.com/fisma-benefit-app/benefit-app/commit/fa4b4aa6c9ca95d40bb1d690b4b2fb0aa4559db6) ja [00b2da1](https://github.com/fisma-benefit-app/benefit-app/commit/00b2da1cd41bc79bf627ef5e9f20d04765ab78d8)

## Tietokannasta tuleva json

Tietokannasta voisi tulla esimerkiksi seuraavanlainen json:

```
{
  "id": 44,
  "projectName": "project-x",
  "version": 1,
  "createdDate": "2025-01-28T17:23:19",
  "totalPoints": 100.12,
  "appUserId": 99,
  "functionalComponents": [
    {
      "id": 99,
      "className": "Interactive end-user input service",
      "componentType": "1-functional",
      "dataElements": 2,
      "readingReferences": 4,
      "writingReferences": 3,
      "functionalMultiplier": 1,
      "operations": null,
      "projectId: 44
    },
    {
      "id": 100,
      "className": "Data storage service",
      "componentType": "entities or classes",
      "dataElements": 4,
      "readingReferences": null,
      "writingReferences": null,
      "functionalMultiplier": null,
      "operations": null,
      "projectId: 44
    }
  ]
}
```
Jos käyttäjä haluaa projektiin uuden functionalComponentin, tarvisee tietokannasta saada uusi id ja oikea projectId. Tällöin tietokannasta tuleva uusi fucntionalComponent json-olisi:
```
    {
      "id": 100,
      "className": null,
      "componentType": null,
      "dataElements": null,
      "readingReferences": null,
      "writingReferences": null,
      "functionalMultiplier": null,
      "operations": null,
      "projectId: 44
    }
```

## Front ja functionalComponents

React-komponentti FunctionClassComponent saa parametrikseen componentProp.

componentProp on tyypiltään geneerinen:

```
export type TGenericComponent = {
  id: number,
  className: string | null,
  componentType: string | null,
  dataElements: number | null;
  readingReferences: number | null;
  writingReferences: number | null;
  functionalMultiplier: number | null;
  operations: number | null;
  projectId: number;
}
```

Ainosastaan attribuurit id ja projectId ovat määritetty vain numberieksi.

componentProp on (varmaankin 🤔) pakko olla geneerinen, jotta FunctionalClassComponentissa voitaisiin ottaa inputtina kaikki eri
toimintoluokan vaihtoehdot JA koska käyttäjän halutaan voivan täysin vapaasti muutella
FunctionalClassComponentissa renderöitäviä toimintoluokkia.

componentProp syötetään FunctionalClassComponent-komponentin alustavaksi component nimiseksi stateksi. Komponentilla on siis yksi state (component) ja sit muuttamalla käyttäjälle tulee haluttu renderöinti ja projektin sisältämät toimintoluokat (eli component(s)) saadaan muokattua halutun kaltaiseksi. 

### Tyypitys

Jäljelle jäi selvittää, miten component:in saisi tyypitettyä sen jälkeen kun component:lla on className. Olisi siistiä, jos calculations funktioon saisi syötettyä aina sille tarkoitetun tyypin mukaisen objektin. Ei varmaan ole täydellinen maailmanloppu, jos calculate funktioihin menisikin geneerinen tyyppi, mutta täytyy miettiä ja tutkia, miten tarkemman tyypityksen voisi (tai voiko 🤔) mahdollisesti toteuttaa.   

### FunctionalClassComponentin rakenne

Jatkoa ajatellen komponentin toimintalogiikan voi laittaa omaan hook:iin. Return osion voi halutessaan jakaa pienempiin komponentteihin ja syöttää pienemmille osille propsina component:in ja tarvittavan funktion.
