import { defineConfig } from "vitepress"

export default defineConfig({
  title: "ScyllinX",
  description: "A modern TypeScript ORM for ScyllaDB and SQL databases",
  base: "/scyllinx/",
  themeConfig: {
    logo: "/logo.png",
    nav: [
      { text: "Guide", link: "/guide/introduction" },
      { text: "API Reference", link: "/api/index" },
      { text: "Examples", link: "/examples/basic-usage" },
      { text: "GitHub", link: "https://github.com/selori/scyllinx" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Introduction", link: "/guide/introduction" },
            { text: "Installation", link: "/guide/installation" },
            { text: "Quick Start", link: "/guide/quick-start" },
            { text: "Configuration", link: "/guide/configuration" },
          ],
        },
        {
          text: "Core Concepts",
          items: [
            { text: "Models", link: "/guide/models" },
            { text: "Query Builder", link: "/guide/query-builder" },
            { text: "Relationships", link: "/guide/relationships" },
            { text: "Migrations", link: "/guide/migrations" },
            { text: "Schema Builder", link: "/guide/schema" },
          ],
        },
        {
          text: "Advanced Features",
          items: [
            { text: "Factories & Seeders", link: "/guide/factories-seeders" },
            { text: "ScyllaDB Features", link: "/guide/scylladb-features" },
            { text: "Performance", link: "/guide/performance" },
            { text: "Testing", link: "/guide/testing" },
          ],
        },
      ],
      "/api/": [
        {
          text: "Connection",
          items: [
            { text: "Connection", link: "/api/connection" },
            { text: "Connection Manager", link: "/api/connectionmanager" },
          ],
        },
        // {
        //   text: "Decorators",
        //   items: [
        //     { text: "Index", link: "/api/index" }, // Eğer decorator'lar burada tanımlıysa
        //   ],
        // },
        {
          text: "Drivers",
          items: [
            { text: "Database Driver", link: "/api/databasedriver" },
            { text: "ScyllaDB Driver", link: "/api/scylladbdriver" },
            { text: "PostgreSQL Driver", link: "/api/postgresqldriver" },
            { text: "MySQL Driver", link: "/api/mysqldriver" },
            { text: "SQLite Driver", link: "/api/sqlitedriver" },
            { text: "MongoDB Driver", link: "/api/mongodbdriver" },
          ],
        },
        {
          text: "Grammars",
          items: [
            { text: "Query Grammar", link: "/api/querygrammar" },
            { text: "ScyllaDB Grammar", link: "/api/scylladbgrammar" },
            { text: "PostgreSQL Grammar", link: "/api/postgresqlgrammar" },
            { text: "MySQL Grammar", link: "/api/mysqlgrammar" },
            { text: "SQLite Grammar", link: "/api/sqlitegrammar" },
            { text: "MongoDB Grammar", link: "/api/mongodbgrammar" },
          ],
        },
        {
          text: "Migration",
          items: [
            { text: "Migration", link: "/api/migration" },
            { text: "Migration Manager", link: "/api/migrationmanager" },
          ],
        },
        {
          text: "Model",
          items: [
            { text: "Model", link: "/api/model" },
            { text: "Model Registry", link: "/api/modelregistry" },
          ],
        },
        {
          text: "Query",
          items: [
            { text: "Query Builder", link: "/api/querybuilder" },
          ],
        },
        {
          text: "Relationships",
          items: [
            { text: "BelongsTo", link: "/api/belongsto" },
            { text: "BelongsToMany", link: "/api/belongstomany" },
            { text: "HasMany", link: "/api/hasmany" },
            { text: "HasOne", link: "/api/hasone" },
            { text: "MorphMany", link: "/api/morphmany" },
            { text: "MorphOne", link: "/api/morphone" },
            { text: "MorphTo", link: "/api/morphto" },
            { text: "Relationship", link: "/api/relationship" },
          ],
        },
        {
          text: "Schema Builder",
          items: [
            { text: "Schema", link: "/api/schema" },
            { text: "Column Builder", link: "/api/columnbuilder" },
            { text: "Table Builder", link: "/api/tablebuilder" },
            { text: "Table Options Builder", link: "/api/tableoptionsbuilder" },
            { text: "Foreign Key Builder", link: "/api/foreignkeybuilder" },
            { text: "Materialized View Builder", link: "/api/materializedviewbuilder" },
            { text: "User Defined Type Builder", link: "/api/userdefinedtypebuilder" },
            { text: "User Defined Function Builder", link: "/api/userdefinedfunctionbuilder" },
            { text: "User Defined Aggregate Builder", link: "/api/userdefinedaggregatebuilder" },
          ],
        },
        {
          text: "Seeder",
          items: [
            { text: "Seeder", link: "/api/seeder" },
            { text: "Model Factory", link: "/api/modelfactory" },
          ],
        },
      ],
      "/examples/": [
        {
          text: "Examples",
          items: [
            { text: "Basic Usage", link: "/examples/basic-usage" },
            { text: "Advanced Queries", link: "/examples/advanced-queries" },
            { text: "Relationships", link: "/examples/relationships" },
            { text: "ScyllaDB Specific", link: "/examples/scylladb" },
            { text: "Real-world Apps", link: "/examples/real-world" },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/selori/scyllinx" },
      // { icon: "discord", link: "https://discord.gg/scyllinx" },
      // { icon: "twitter", link: "https://twitter.com/scyllinx" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: `Copyright © ${new Date().getFullYear()} ScyllinX Team`,
    },
    editLink: {
      pattern: "https://github.com/selori/scyllinx/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
    search: {
      provider: "local",
    },
  },
  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    lineNumbers: true,
  },
})
