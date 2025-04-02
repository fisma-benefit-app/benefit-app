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
Jopa Fisman työntekijöille, sekä juniorit että seniorit, jotka haluavat nopee sanahaku encyclopediasta ja selkeitä esimerkkejä.

* Skaalaus ongelma. Kun selaimen on pienempi tai puolinäytönä niin ei näy kokonaan tietokoneessa, selain on Microsoft Edge.

* Kun kirjautuu ulos englannin käyttöliitymästä, kysymyslaatikko on suomeksi eikä englanti.
Ts. Haluatko varmasti kirjautua ulos? --> Do you really want to logout?

* Kun kommentti kirjoitetaan ylös ja vaihtaa sitten toimintotyypin (classname), niin kommentti poistuu eikä tallennu.
Pitä määritä koodiin, että kommentti tallennetaan ja pysyy jokaisten toimintotyypin vaihdossa.

* Ärsyke: Not a number -buggi (NaN). Ei anna virheilmoitusta, kun laittaa tietoelemnttiin laitta esim. aakkosen.
Ei pysty muutamaan tai korjaamaan heti, vaan pitää ensin maalata koko kentän ja sitten Delete.


* PDF-tallennus ei toimi oikein.Tarkkaan ottaen, tulostus näyttää väärältä.

 




