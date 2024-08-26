import { Request, Response } from 'express';

const mockFindOne = jest.fn().mockResolvedValue(null);
const mockInsertOne = jest.fn();
const mockUpdateOne = jest.fn();
const mockClose = jest.fn();
jest.mock('mongodb', () => ({
  MongoClient: jest.fn(() => ({
    connect: jest.fn(),
    db: jest.fn(() => ({
      collection: jest.fn(() => ({
        findOne: mockFindOne,
        insertOne: mockInsertOne,
        updateOne: mockUpdateOne,
      })),
    })),
    close: mockClose,
  })),
}));

let mockBody;
const res: Partial<Response> = {
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
};
const req: Partial<Request> = {
  params: { clientId: '1234' },
};

const { getSettingsByClientId, putSettingsByClientId } = jest.requireActual('../../../src/controllers/settings');

describe('Settings Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockBody = {
      deliveryMethods: [
        {
          name: 'Print',
          enum: 'PRINT',
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
  });

  describe('getSettingsByClientId', () => {
    it('should return default settings if no settings are found for the clientId', async () => {
      const req: Partial<Request> = {
        params: { clientId: '1234' },
      };

      await getSettingsByClientId(req, res);

      expect(mockFindOne).toHaveBeenCalledWith({ clientId: '1234' });
      expect(mockInsertOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ clientId: 1234 }));
      expect(mockClose).toHaveBeenCalled();
    });

    it('should return the settings if they are found for the clientId', async () => {
      mockFindOne.mockResolvedValue({ clientId: 1234 });

      await getSettingsByClientId(req, res);

      expect(mockFindOne).toHaveBeenCalledWith({ clientId: '1234' });
      expect(mockInsertOne).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ clientId: 1234 }));
      expect(mockClose).toHaveBeenCalled();
    });

    it('should return a 500 status if an error occurs', async () => {
      mockFindOne.mockRejectedValue(new Error('Database error'));

      await getSettingsByClientId(req, res);

      expect(mockFindOne).toHaveBeenCalledWith({ clientId: '1234' });
      expect(mockInsertOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('putSettingsByClientId', () => {
    it('should return a 400 status if the settings are invalid', async () => {
      const req: Partial<Request> = {
        params: { clientId: '1234' },
        body: mockBody,
      };

      req.body.deliveryMethods[0].order = 'hola';

      await putSettingsByClientId(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: '"deliveryMethods[0].order" must be a number' });
    });

    it('should update the settings for the clientId', async () => {
      const req: Partial<Request> = {
        params: { clientId: '1234' },
        body: mockBody,
      };

      await putSettingsByClientId(req, res);

      expect(mockUpdateOne).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Settings updated' });
      expect(mockClose).toHaveBeenCalled();
    });

    it('should return a 500 status if an error occurs', async () => {
      const req: Partial<Request> = {
        params: { clientId: '1234' },
        body: mockBody,
      };

      mockUpdateOne.mockRejectedValue(new Error('Database error'));

      await putSettingsByClientId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating settings' });
      expect(mockClose).toHaveBeenCalled();
    });
  });
});
