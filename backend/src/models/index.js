const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'cuenta_clara_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'cuenta_clara',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false
  }
);

const LunchEvent = sequelize.define(
  'LunchEvent',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(180), allowNull: false },
    event_date: { type: DataTypes.DATEONLY, allowNull: false },
    payer_name: { type: DataTypes.STRING(140), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'ARCHIVED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    expires_at: { type: DataTypes.DATEONLY, allowNull: true }
  },
  {
    tableName: 'lunch_events',
    underscored: true,
    timestamps: true
  }
);

const Participant = sequelize.define(
  'Participant',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    lunch_event_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'lunch_events', key: 'id' }
    },
    full_name: { type: DataTypes.STRING(140), allowNull: false },
    payment_status: {
      type: DataTypes.ENUM('PENDING', 'PAID'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    payment_method: {
      type: DataTypes.ENUM('YAPE', 'PLIN', 'CASH', 'TRANSFER', 'OTHER'),
      allowNull: true
    },
    paid_at: { type: DataTypes.DATE, allowNull: true }
  },
  {
    tableName: 'participants',
    underscored: true,
    timestamps: true
  }
);

const ConsumptionItem = sequelize.define(
  'ConsumptionItem',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    participant_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'participants', key: 'id' }
    },
    description: { type: DataTypes.STRING(180), allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  },
  {
    tableName: 'consumption_items',
    underscored: true,
    timestamps: true
  }
);

LunchEvent.hasMany(Participant, {
  foreignKey: 'lunch_event_id',
  onDelete: 'CASCADE'
});
Participant.belongsTo(LunchEvent, { foreignKey: 'lunch_event_id' });
Participant.hasMany(ConsumptionItem, {
  foreignKey: 'participant_id',
  onDelete: 'CASCADE'
});
ConsumptionItem.belongsTo(Participant, { foreignKey: 'participant_id' });

async function initOrm() {
  await sequelize.authenticate();
  await sequelize.sync();
}

module.exports = { sequelize, initOrm };