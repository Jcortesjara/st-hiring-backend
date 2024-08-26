import { MongoClient } from 'mongodb';
import { Request, Response } from 'express';
import { Settings } from '../entity/settings';
import { validateSettings } from '../validators/settings-validator';

const uri = 'mongodb://root:example@localhost:27017';
const client = new MongoClient(uri);

const defaultSetting: Partial<Settings> = {
  deliveryMethods: [
    {
      name: 'Print Now',
      enum: 'PRINT_NOW',
      order: 1,
      isDefault: true,
      selected: true,
    },
    {
      name: 'Print@Home',
      enum: 'PRINT_AT_HOME',
      order: 2,
      isDefault: false,
      selected: true,
    },
  ],
  fulfillmentFormat: {
    rfid: false,
    print: false,
  },
  printer: {
    id: null,
  },
  printingFormat: {
    formatA: true,
    formatB: false,
  },
  scanning: {
    scanManually: true,
    scanWhenComplete: false,
  },
  paymentMethods: {
    cash: true,
    creditCard: false,
    comp: false,
  },
  ticketDisplay: {
    leftInAllotment: true,
    soldOut: true,
  },
  customerInfo: {
    active: false,
    basicInfo: false,
    addressInfo: false,
  },
};

const getCollection = async (collectionName: string) => {
  try {
    await client.connect();
    const database = client.db('st-hiring-backend-mongo-1');
    return database.collection(collectionName);
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error;
  }
};

export const getSettingsByClientId = async (req: Request, res: Response) => {
  const { clientId } = req.params;

  try {
    const settingsCollection = await getCollection('settings');
    let setting: any = await settingsCollection.findOne({ clientId });

    if (!setting) {
      const newSetting = { ...defaultSetting, clientId: Number(clientId) };
      await settingsCollection.insertOne(newSetting);
      setting = newSetting;
    }

    res.json(setting);
  } catch (error) {
    console.error('Error al obtener o crear la configuración:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
};

export const putSettingsByClientId = async (req: Request, res: Response) => {
    const { clientId } = req.params;
    const settings = req.body;
  
    const { error } = validateSettings(settings);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  
    try {
      const settingsCollection = await getCollection('settings');
      const query = { clientId };
      const newSettings = { $set: settings };
      const options = { upsert: true };
  
      await settingsCollection.updateOne(query, newSettings, options);
  
      return res.json({ message: 'Settings updated' });
    } catch (error) {
      console.error('Error al actualizar la configuración:', error);
      return res.status(500).json({ message: 'Error updating settings' });
    } finally {
      await client.close();
    }
  };


