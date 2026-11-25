1-Donner dans l'ordre tout les middlewares traversé par une requete post vers /api/auth/resgister depuis app.ts jusqu'au controller

requestId
pinohttp
helmet
cors
express.json
express.urlencoded
createRateLimiter
authrouter
registerLimiters
validateBody
asyncHandler
authController

2-expliquer pourquoi authenticate n'est pas executer

parceque authenticate il n'est pas déclaré dans la chaine de middleware de la route api/auth/register 
car son objectif est de verifier si une requete possede un token jwt est valide 

{
    "name": "   awa ndiaye  ",
    "email": "AWA@EXAMPLE.COM",
    "password": "passer1234",
    "password_confirmation": "passer1234",
    "role": "admin"
}

pour cette requete donnez les valeurs reçues par authService.register():

les valeurs reçues sont : 
{
    name: "awa ndiaye",
    email: "awa@example.com",
    password: "Passer1234",
    password_confirmation: "Passer1234"
}

-expliquer ce qui arrive au champ role et pourquoi le compte creer va rester un compte apprenant 
 C'est le backend qui lui attribue automatiquement le rôle
le champ role n'est pas venu parceque le authService.register   et il n'est pas retourné parceque le default est LEARNER et c'est le service qui l'impose 


5-citer les 4 tables normalement alimenter apres une inscription reussie

user
auth_one_times_tokens
auth_refresh_token
auth_audit_evens
  
pour chaque table dire s'il y'a des donnees cryptés
user (password)
auth_one_times_tokens(token)
auth_refresh_token (refresh token)



6-pourquoi findByEmail ne suffit il pas pour garantir l'unicité de l'email quelle autre protection existe et quelle erreur peut elle produire


c'est parcequ'il ne garantit pas l'inscription simultanée ,au niveau de la base de donnees la colonne de l'email possede une contrainte unique qui va aussi verifier l'email 
et l'erreur peut etre un conflit 

Apres une inscription reussie le terminal doit afficher un log structuré contenant uniquement :
-l'id du compte
-le nom du compte
-le message nouveau compte creer

contraintes:
aucun log si l'inscription echoue 
aucun mot de passe ,email,jeton dans ce log 

utiliser le logger du projet pas de console.log

dans authService juste apres la creation du compte

logger.info({
    id: user.id,
    name: user.name,
    message: 'Nouveau compte créé'
})


7- la reponse 201 created doit contenir Location:/api/users/{/id-nouvelle-utilisateur}

const result = await service.register(
      request.validated?.body as RegisterInput,
      sessionContext(request),
    )
response.location(`/api/users/${result.user.id}`)
return sendSuccess(response, result, 201)

8-toutes les reponses creer par sendsuccess(doivent inclure l'identifiant deja placé dans l'entete  x-request-id):
{
    "success":true,
    "data":{},
    "request_id":""
}

 dans le api-reponse dans la methode sendsuccess on retourne 
return response.status(status).json({success: true, data,...(meta ? { meta } : {}),request_id: response.getHeader('x-request-id'),
  })




 ajouter la clé x-request-id-generated :true lorsque le server genere uuid et false lorsque  l'uuid n'est pas generer par le server