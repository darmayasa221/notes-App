const InvariantError = require('../../exceptions/InvariantError');
const ExportNotesPayloadSchema = require('./schema');

const ExportsValidator = {
  validatorExportNotesPayload: (payload) => {
    const validatorResult = ExportNotesPayloadSchema.validate(payload);

    if (validatorResult.error) {
      throw new InvariantError(validatorResult);
    }
  }
};

module.exports = ExportsValidator;
