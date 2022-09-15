const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

const JWTSecret = "f45777f3-a02d-4523-84e4-ad53deb0965a";

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const DB = {
  games: [
    {
      id: 1,
      title: "Dino Crisis",
      year: "2002",
    },
    {
      id: 2,
      title: "Tomb Raider",
      year: "1996",
    },
  ],
  users: [
    {
      id: 1,
      email: "joe.doe@gmail.com",
      password: "teste123",
    },
    {
      id: 2,
      email: "20201107@ielusc.br",
      password: "20201107",
    },
    {
      id: 3,
      email: "lucas.leoni@gmail.com",
      password: "123teste",
    },
  ],
};

function auth(req, res, next) {
  const authToken = req.headers["authorization"];
  console.log(authToken);

  if (authToken !== undefined) {
    // Dividindo o nosso token em duas partes
    const bearer = authToken.split(" ");
    console.log("BEARER: ", bearer);

    const token = bearer[1];

    jwt.verify(token, JWTSecret, (err, data) => {
      if (err) {
        res.status(401);
        res.json({ message: "ERR6: Token inválido." });
      } else {
        console.log(data);
        req.token = token;
        req.loggedUser = { id: data.id, email: data.email };
        next();
      }
    });
  } else {
    res.status(401);
    res.json({
      message: "ERR7: Ops, essa rota está protegida, não é possível acessá-la.",
    });
  }
}

app.get("/games", auth, (req, res) => {
  console.log(req.loggedUser);
  res.json(DB.games);
});

app.get("/users", (req, res) => {
  res.json(DB.users);
});

// Endpoint de autenticação dos meus usuários
app.post("/auth", (req, res) => {
  const { email, password } = req.body;
  if (email !== undefined) {
    const user = DB.users.find((u) => u.email == email);
    if (user !== undefined) {
      if (user.password === password) {
        // Gerando o nosso token assim que o usuário fez login com sucesso
        // As informações do paylod do token serão id e email
        // Assinatura do token
        jwt.sign(
          {
            id: user.id,
            email: user.email,
          },
          JWTSecret, // Checando a chave secreta da minha aplicação
          {
            expiresIn: "1h", // Tempo de expiração do token
          },
          (err, token) => {
            if (err) {
              console.log(err);
              res.status(400);
              res.json({
                message: "ERR5: Ops, não foi possível gerar o token.",
              });
            } else {
              res.status(200);
              /* res.json({
                message: "Usuário logado com sucesso, token enviado!",
              }); */
              res.json({ token });
            }
          }
        );
      } else {
        res.status(401);
        res.json({ message: "ERR2: Ops, E-mail ou Password não coincidem." });
      }
    } else {
      res.status(404);
      res.json({ message: "ERR3: Ops, usuário não existe." });
    }
  } else {
    res.status(400);
    res.json({ message: "ERR1: E-mail ou Password não podem ser nulos." });
  }
});

app.listen(5000, () => {
  console.log("Sony API => http://localhost:5000");
});

/* {
  "email": "teste@teste.com",
  "password": "20201107"
} */
