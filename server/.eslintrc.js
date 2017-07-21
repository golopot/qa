module.exports = {
	'env': {
		'es6': true,
		'node': true
	},
	'extends': 'eslint:recommended',
	'rules': {
		'indent': [2, 'tab', { MemberExpression: 'off'}],
		'linebreak-style': [2,'unix'],
		'quotes': [2, 'single'],
		'semi': [2, 'never'],
		'no-console': [0],
		'no-unused-vars': [2, { argsIgnorePattern: 'next' }],
	}
}
