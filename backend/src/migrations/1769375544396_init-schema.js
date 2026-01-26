/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("merkle_nodes", {
    level: {
      type: "smallint",
      notNull: true,
    },
    idx: {
      type: "integer",
      notNull: true,
    },
    hash: {
      type: "varchar(78)",
      notNull: true,
    },
  });

  pgm.addConstraint("merkle_nodes", "merkle_nodes_pkey", {
    primaryKey: ["level", "idx"],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("merkle_nodes");
};
