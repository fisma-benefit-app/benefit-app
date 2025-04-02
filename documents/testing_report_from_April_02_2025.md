# Report from April 02 2025.

This is a report from our testing seminar together with Haaga-Helia University of Applied Sciences
on the April 02 2025.

The testing group consists of Finnish speaking students.

## Notes from testers

* Eri vuorovaikutuksia syöttötoiminto, kuten saunavuoroja. Lukuviitauksia eri muutamia ja tietoelementjä X määrä.
Mitä sitten meillä kymmenen näyttöä, josta kolme sivustoja ovat syöttö ja kaksi navigointi,
kuten esim. tarkistaa saunavuoro ilman syöttö -kyselytoiminta, varaa sauna -syöttötoiminto, peruu sauna -syöttötoiminto,
lähettää valituksen -syöttötoiminto, jne.

Kirjaudutaanko tähän samaan tai eriin. --> Vastaus: Uusi funktionaalinen komponentti tekee tämä.
Ehkä pitäisi opastaa tästä tarkemmin.

Jokaisesta elementeistä ovat sivukohtaisia ja kartoitetaan yksityiskohtaisia.

* Valmistusaste oli yhdelle epäselvä.

* Lukuviitaus ja toimintotyypit oli monelle epäselvä. Vaatimusdokumentointi oli esimerkkejä, muttei tarkkaa ja selkeä selityksiä.

--> Pitäisikö meidän tehdän vaatimusmääritelmästä ja itse sovelluksesta opasteet / manuaali (kuten kaikkissa tuoteissa eka kerran käyttössä).
Jopa Fisman työntekijöille, sekä juniorit että seniorit, jotka haluavat nopee sanahaku encyclopediasta (mieluiten 10 sivua kuin 200 sivua) ja selkeitä esimerkkejä.
Voisiko sovelluksiin olisi oma encyclopedia tai selityksiä popup kun hiiri osoitaa sanaa (piilotettu selitys -div).

* Skaalaus ongelma. Kun selaimen on pienempi tai puolinäytönä niin ei näy kokonaan tietokoneessa, selain on Microsoft Edge.

* Kun kirjautuu ulos englannin käyttöliitymästä, kysymyslaatikko on suomeksi eikä englanti.
Ts. Haluatko varmasti kirjautua ulos? --> Do you really want to logout?

* Kun kommentti kirjoitetaan ylös ja vaihtaa sitten toimintotyypin (classname), niin kommentti poistuu eikä tallennu.
Pitä määritä koodiin, että kommentti tallennetaan ja pysyy jokaisten toimintotyypin vaihdossa.

* Ärsyke: Not a number -buggi (NaN). Ei anna virheilmoitusta, kun laittaa tietoelemnttiin laitta esim. aakkosen.
Ei pysty muutamaan tai korjaamaan heti, vaan pitää ensin maalata koko kentän ja sitten Delete.


* PDF-tallennus ei toimi oikein.Tarkkaan ottaen, tulostus näyttää väärältä.

* Yhdellä tuli 404 errori kun yriti editoida valmiina tehty projekti. Sitten se hävitti projekti.
  --> Google chrome -selain ongelma: Pitkään kirjautuneena johtaa ongelmia (ei pysty luoda projektia eikä näy projektia).
  --> Eri selaimessa pitää laatutarkistaa.

* Valmiuasteen ei pysty kirjoitaa alkuun nolla. Lisäksi kun paina ENTERiä niin silloin tulee hälytyksen, mutta se joutuu ensiksi
collapseen sisään. Eli aina kun paina ENTERiä, valittu komponenttirivi collapsaan itseään, joka pilottaa samalla virheilmoituksen.

* Korjattu: Piste muutuu pilkkuksi automaatisesti valmiusasteessa.

* Save nappula häviää kun on tehnyt paljon, eli kun scrollaan alas. Pitää olla sticky.

 




