"use strict";

/**
 * This migration updates the appointments table:
 * 1. Adds 'unassigned' to the status enum
 * 2. Makes userId nullable
 *
 * For PostgreSQL only.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add 'unassigned' to the status enum
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_appointments_status') THEN
          CREATE TYPE enum_appointments_status AS ENUM ('unassigned', 'scheduled', 'completed', 'cancelled', 'no_show');
        ELSE
          -- Add 'unassigned' if not present
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum WHERE enumlabel = 'unassigned' AND enumtypid = (
              SELECT oid FROM pg_type WHERE typname = 'enum_appointments_status'
            )
          ) THEN
            ALTER TYPE enum_appointments_status ADD VALUE 'unassigned' BEFORE 'scheduled';
          END IF;
        END IF;
      END$$;
    `);

    // 2. Make userId nullable
    await queryInterface.changeColumn('appointments', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Remove 'unassigned' from the enum (not directly possible, so recreate the enum)
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_appointments_status_new AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
      ALTER TABLE appointments ALTER COLUMN status TYPE enum_appointments_status_new USING status::text::enum_appointments_status_new;
      DROP TYPE enum_appointments_status;
      ALTER TYPE enum_appointments_status_new RENAME TO enum_appointments_status;
    `);

    // 2. Make userId NOT NULL again
    await queryInterface.changeColumn('appointments', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    });
  }
};
