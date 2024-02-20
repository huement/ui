module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint-config-prettier",
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                "!.eslintrc.{js,cjs}", "!package.json"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "plugins": [
        "eslint-plugin-prettier",
        "import"
    ],
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
        "jsx": true,
        "classes": true,
        "defaultParams": true
        }
    },
    "rules": {
		"import/no-absolute-path": [2, { commonjs: false, amd: false }],
		"@typescript-eslint/no-non-null-assertion": "warn",
        "prettier/prettier": ["error", { "semi": false }],
        "no-const-assign": 1,
        "no-extra-semi": 1,
        "semi": 0,
        "no-fallthrough": 0,
        "no-empty": 0,
        "no-mixed-spaces-and-tabs": 1,
        "no-redeclare": 0,
        "no-this-before-super": 1,
        "no-undef": 1,
        "no-unreachable": 1,
        "no-unused-vars": 1,
        "no-use-before-define": 0,
        "constructor-super": 1,
        "curly": 0,
        "eqeqeq": 1,
        "func-names": 1,
    }
}
