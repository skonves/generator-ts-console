"use strict";

const Generator = require("yeoman-generator");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option("code", { type: Boolean, default: true });
  }

  initializing() {
    this.pkg = this.fs.readJSON(this.destinationPath("package.json"), {});

    if (this.pkg && Object.keys(this.pkg).length) {
      console.log("Found existing package.json:");
      console.log(this.pkg);
    }
  }

  writing() {
    [
      ".prettierrc",
      "tsconfig.json",
      "tslint.json",
      ".gitignore",
      ".nycrc"
    ].forEach(file => {
      this.fs.copy(this.templatePath(file), this.destinationPath(file));
    });

    if (this.options.code) {
      ["src/index.ts", "src/index.tests.ts"].forEach(file => {
        this.fs.copy(this.templatePath(file), this.destinationPath(file));
      });
    }

    this.fs.copyTpl(
      this.templatePath("package.json"),
      this.destinationPath("package.json"),
      {
        name: this.pkg.name || "typescript-application",
        version: this.pkg.version || "0.0.1",
        description:
          this.pkg.description ||
          "Base project for creating a console application in Typescript",
        author: this.pkg.author || "",
        license: this.pkg.license || "ISC"
      }
    );

    this.fs.copyTpl(
      this.templatePath("README.md"),
      this.destinationPath("README.md"),
      {
        name: this.pkg.name || "Typescript Application",
        description:
          this.pkg.description ||
          "Base project for creating a console application in Typescript"
      }
    );
  }

  install() {
    this.npmInstall(
      [
        "typescript",
        "@types/node",
        "prettier",
        "tslint",
        "mocha",
        "@types/mocha",
        "chai",
        "@types/chai",
        "nyc",
        "ts-node",
        "source-map-support"
      ],
      {
        "save-dev": true
      }
    );
  }
};
