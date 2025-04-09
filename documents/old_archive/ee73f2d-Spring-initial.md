# ee73f2d (Spring initial setup)

documentti koskee committia: [ee73f2d](https://github.com/fisma-benefit-app/benefit-app/commit/ee73f2dcbe6835d609fbe895b23482090298a118)

### Dependencies

![image](https://github.com/user-attachments/assets/fc445424-9e78-4352-afab-d54e595eee88)


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

![image](https://github.com/user-attachments/assets/039c572f-5c4e-41b8-b663-6b2debac63c0)

---

### application.yaml

![image](https://github.com/user-attachments/assets/c78c74c5-a6d5-4ef0-8ba7-732dd40c6b3a)


Ilman datasourcea ei lähde päälle. Datasource määritetty dockerin Postgrehen. 
