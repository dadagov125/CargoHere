var isProd = process.env.NODE_ENV === 'prod';
var host = isProd ? 'postgres' : 'localhost';
module.exports = {
	"type": "postgres",
	"host": host,
	"port": 5432,
	"username": "postgres",
	"password": "1234567",
	"database": "postgres",
	"synchronize": true,
	"logging": isProd ? 'all' : 'all',
	"entities": [
		"app/entities/**/*.ts",
		"app/entities/**/*.js"
	],
	"migrations": [
		"app/migration/**/*.ts",
		"app/migration/**/*.js"
	],
	"cli": {
		"migrationsDir": "app/migration"
	},
	"subscribers": [
		"app/subscriber/**/*.ts",
		"app/subscriber/**/*.js"
	]
};