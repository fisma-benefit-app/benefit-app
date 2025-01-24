# 9f4ac4a (Spring initial setup)


### Dependencies

![img.png](img/9f4ac4a-1.png)

#### Actuator

- Actuator, jotta voi katsella mm. missä beanit menee.

#### JDBC

- Laitoin alustavast ja voidaan vaihtaa, jos halutaan. Tästä oli video Slacin backend kanavalla.

#### Security, Web, PostgreSQL

- Security kommentoitu vielä pois ja laitetaan päälle kun aika koittaa.

#### Lombok

- Vähentää boilerplatea ja tekee koodista helpompaa lukea.

#### Docker compose

- Automaattinen docker compose. Etsii compose-fileä defaulttina projektin rootista ja mielestäni root on selkeämpi paikka ylipäätään. Sijainti rootissa on mahdollisesti kätevämpi myös CI/CD. 

❗️Huom! Docker Desktopin pitää olla päällä muuten Spring ei lähde päälle ❗️

---

### Testaukseen parempi log

![img.png](img/9f4ac4a-2.png)

---

### application.yaml

![img.png](img/9f4ac4a-3.png)

Ilman datasourcea ei lähde päälle. Datasource määritetty dockerin Postgrehen. 