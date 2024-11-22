import type {HttpContext} from '@adonisjs/core/http'
import User from '#models/user'

/**
 * Controller for the Parameters of a user.
 */
export default class ParametersController {
  /**
   * Function to retrieve the parameters of a user given in the params
   * @param params : id of the user
   * @param response
   */
  public async getParameters({params, response}: HttpContext) {
    try {
      const user = await User.findOrFail(params.id);
      return response.ok(user.parameters);
    } catch (error) {
      return response.status(404).send({message: 'User not found'});
    }
  }

  /**
   * Function to update the user parameters
   * @param params : id of the user
   * @param request
   * @param response
   */
  public async updateParameters({params, request, response}: HttpContext) {
    try {
      const user = await User.findOrFail(params.id);
      const newParameters = request.input('parameters', {});
      user.parameters = {...user.parameters, ...newParameters};
      await user.save();
      return response.ok(user.parameters);
    } catch (error) {
      return response.status(400).send({message: 'Failed to update parameters', error});
    }
  }

  /**
   * Function to delete a Parameter for a user
   * @param params :  id of the user
   * @param request
   * @param response
   */
  public async deleteParameter({params, request, response}: HttpContext) {
    try {
      const user = await User.findOrFail(params.id);
      const keyToDelete = request.input('key');
      if (!keyToDelete) {
        return response.badRequest({message: 'Parameter key is required'});
      }
      const parameters = user.parameters;
      if (!(keyToDelete in parameters)) {
        return response.notFound({message: `Key '${keyToDelete}' not found in parameters`});
      }
      delete parameters[keyToDelete];
      user.parameters = parameters;
      await user.save();
      return response.ok({message: `Parameter '${keyToDelete}' deleted successfully`, parameters});
    } catch (error) {
      return response.status(400).send({message: 'Failed to delete parameter', error});
    }
  }
}
