CREATE TABLE users (
  username TEXT PRIMARY KEY,
  full_name TEXT
);

CREATE TABLE languages (
  language_id SERIAL PRIMARY KEY,
  language_name TEXT
);

CREATE TABLE cvs (
  cv_id SERIAL PRIMARY KEY,
  username TEXT REFERENCES users(username) ON DELETE CASCADE,
  cv_name TEXT,
  language_id INTEGER REFERENCES languages(language_id),
  last_updated TIMESTAMP WITH TIME ZONE
);

CREATE INDEX username_idx ON cvs (username);

CREATE TABLE cv_sections (
  section_id INTEGER,
  language_id INTEGER REFERENCES languages(language_id),
  title TEXT,
  template TEXT,
  section_order INTEGER,
  PRIMARY KEY (section_id, language_id)
);

CREATE TABLE section_data (
  cv_id INTEGER REFERENCES cvs(cv_id) ON DELETE CASCADE,
  section_id INTEGER,
  text TEXT,
  PRIMARY KEY (cv_id, section_id)
);

CREATE INDEX cv_id_idx ON section_data (cv_id);

CREATE TABLE assets (
  filename TEXT PRIMARY KEY,
  filetype TEXT,
  base64 BOOLEAN,
  contents TEXT,
  last_updated TIMESTAMP WITH TIME ZONE
);

INSERT INTO languages VALUES
  (DEFAULT, 'English'),
  (DEFAULT, 'suomi');

INSERT INTO cv_sections VALUES (1, 1, 'INTRODUCTION',
'######Degree


##Job title
```
This bio is a summary that gives the reader a general understanding of you and your talents. Some might not read further, so make sure to include enough information about yourself. You can write e.g. about: relevant industries with special experience, certificates, systems/languages/tools/etc. with special experience.
```
'
, 0);



INSERT INTO cv_sections VALUES (2, 1, 'WORK EXPERIENCE',
'####Current company, XX/20XX-
######Job title


This space is reserved for some general information about your work experience at your current company.


Projects include:


#####Company X, Name of the project, XX/20XX-XX/20XX
######Job title
What was done? What is the big picture? What did you do or be responsible for? Something else important?
> Keywords: xxx, xxx, xxx'
, 100);



INSERT INTO cv_sections VALUES (3, 1, 'PREVIOUS EMPLOYMENT',
'####Company A, XX/20XX-XX/20XX
######Job title
Summary of position, responsibilities, projects etc.
> Keywords: xxx, xxx, xxx


Projects include:


#####Company Y, Role in project, XX/20XX-XX/20XX

- Description of role, project, etc.
- Keywords: xxx, xxx, xxx


#####Company Z, Role in project, XX/20XX-XX/20XX

- Description of role, project, etc.
- Keywords: xxx, xxx, xxx'
, 200);



INSERT INTO cv_sections VALUES (4, 1, 'EDUCATION',
'####Degree, University, 20XX-20XX
Degree Programme

Major: xxx

Minor: xxx

Master’s thesis: xxx'
, 300);



INSERT INTO cv_sections VALUES (5, 1, 'CERTIFICATES',
'Certificate, Month 20XX

Certificate, Month 20XX'
, 400);



INSERT INTO cv_sections VALUES (6, 1, 'LANGUAGE SKILLS',
'Language 1 - skill level

Language 2 - skill level'
, 500);



INSERT INTO cv_sections VALUES (7, 1, 'AWARDS',
'Award, Month 20XX

Award, Month 20XX'
, 600);



INSERT INTO cv_sections VALUES (8, 1, 'PUBLICATIONS',
'Article: Writer(s), 20XX, Article name, Journal name, Page numbers

Book: Writer(s), 20XX, Book name, Publisher, ISBN

Patent: Creator(s), 20XX, Patent name, EU patent number, US patent number'
, 700);



INSERT INTO cv_sections VALUES (9, 1, 'CONFERENCES',
'20XX Name of the Conference, City, Country, speaker/participant

20XX Name of the Conference, City, Country, speaker/participant'
, 800);



INSERT INTO cv_sections VALUES (10, 1, 'OTHER ACTIVITIES',
'- GitHub/Bitbucket: www.xxxx.fi
- Portfolio: www.xxxx.fi',
900);



INSERT INTO cv_sections VALUES (11, 1, 'ESSENTIAL SKILLS',
'- Concrete, higher level skills and areas of knowledge are listed here (cross-check with bio)
- Long experience in xxx


####Knowledge and experience of:

- Specific technologies are listed here under various categories, no sentences
- ** Programming languages **: xxx, xxx, xxx'
, 1000);



INSERT INTO cv_sections VALUES
(1, 2, 'ESITTELY',
'######Tutkinto


##Tehtävänimike
```
Tarkoituksena on, että lukija saa jo pelkästään bion lukemalla hyvän käsityksen huippiksesta ja hänen osaamisestaan (kaikki eivät edes lue pidemmälle). Tähän voi kirjoittaa esimerkiksi seuraavista aiheista: toimialat, joista erityistä kokemusta, sertifikaatit, käyttöjärjestelmät/kielet/työkalut/ ym., joista erityistä kokemusta.
```'
, 0),

(2, 2, 'TYÖKOKEMUS',
'####Nykyinen työpaikka, XX/20XX-
######Tehtävänimike


Tähän voi kirjoittaa jotain yleistä työkokemuksesta tämän hetkisessä työpaikassa.


Esimerkkejä projekteista:


#####Yritys X, Projektin nimi, XX/20XX-XX/20XX
######Tehtävänimike
Mitä tehtiin? Mihin liittyi/kokonaiskuva? Mitä teit/olit vastuussa? Lopputulokset? Jotain muuta tärkeää?
> Avainsanat: xxx, xxx, xxx'
, 100),

(3, 2, 'AIKAISEMPI TYÖKOKEMUS',
'####Yritys A, XX/20XX-XX/20XX
######Tehtävänimike
Yhteenveto, vastuualueet, projektit jne.
> Avainsanat: xxx, xxx, xxx


Esimerkkejä projekteista:


#####Yritys Y, Rooli projektissa, XX/20XX-XX/20XX

- Kuvaus roolista, projektista, jne.
- Avainsanat: xxx, xxx, xxx


#####Yritys Z, Rooli projektissa, XX/20XX-XX/20XX

- Kuvaus roolista, projektista, jne.
- Avainsanat: xxx, xxx, xxx'
, 200),

(4, 2, 'KOULUTUS',
'####Tutkinto, Yliopisto, 20XX-20XX
Tutkinto-ohjelma

Pääaine: xxx

Sivuaine: xxx

Diplomityö: xxx'
, 300),

(5, 2, 'SERTIFIKAATIT',
'Sertifikaatti, kuukausi 20XX

Sertifikaatti, kuukausi 20XX'
, 400),

(6, 2, 'KIELITAITO',
'Kieli 1 - taso

Kieli 2 - taso'
, 500),

(7, 2, 'PALKINNOT',
'Palkinto, kuukausi 20XX

Palkinto, kuukausi 20XX'
, 600),

(8, 2, 'JULKAISUT',
'Artikkeli: Kirjoittaja(t), 20XX, Artikkelin nimi, , Sivunumerot

Kirja: Kirjailija(t), 20XX, Kirjan nimi, Julkaisija, ISBN

Patentti: Tekijä(t), 20XX, Patentin nimi, Eurooppa-patentti numero, US-patentti numero'
, 700),

(9, 2, 'KONFERENSSIT',
'20XX Konferenssin nimi, Kaupunki, Maa, puhuja/osallistuja

20XX Konferenssin nimi, Kaupunki, Maa, puhuja/osallistuja'
, 800),

(10, 2, 'HARRASTUNEISUUS',
'- GitHub/Bitbucket: www.xxxx.fi
- Portfolio: www.xxxx.fi'
, 900),

(11, 2, 'OSAAMINEN',
'- Tähän olisi tarkoitus laittaa mahdollisimman konkreettisia osaamisalueita ylätasolla (cross-check bion kanssa)
- Pitkä kokemus xxx


####Osaamisalueita:

- Tähän listataan tarkemmin teknologiat eri kategorioiden alle, ei lauseita
- ** Ohjelmointikielet **: xxx, xxx, xxx'
, 1000);
