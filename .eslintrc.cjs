module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": "standard-with-typescript",
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                "!.eslintrc.{js,cjs}", "!bump.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
		"import/no-absolute-path": [2, { commonjs: false, amd: false }],
		"@typescript-eslint/no-non-null-assertion": "warn"
    }
}
