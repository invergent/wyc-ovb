import krypter from '../krypter';
import PasswordResetService from '../../services/PasswordResetService';

class PasswordResetHelper {
  static async findAndValidateResetRequest(staffId, hash) {
    const passwordResetRequest = await PasswordResetService.fetchPasswordResetRequest(staffId);
    if (!passwordResetRequest) return [404, 'Reset link is expired'];
    if (hash !== passwordResetRequest.passwordResetHash) return [403, 'Reset link is invalid'];

    PasswordResetService.deletePasswordResetRequest(staffId);
    return [200, 'valid'];
  }

  static createAndSaveResetHash(staffId) {
    const passwordResetHash = krypter.createCryptrHash(`${process.env.RESET_SECRET} ${staffId}`);

    const data = { staffId, passwordResetHash, status: 'Pending' };
    PasswordResetService.updateOrInsertResetRequest(data);
    return passwordResetHash;
  }
}

export default PasswordResetHelper;
