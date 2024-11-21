import Router from '@adonisjs/core/services/router'
import router from "@adonisjs/core/services/router";
import ParametersController from "../app/controllers/Users/parameters_controller.js";

/**
 * Routes for the parameters
 */
Router.group(() => {
  router.get('/:id', [ParametersController, 'getParameters']).as('parameters.get')
  router.put('/:id', [ParametersController, 'updateParameters']).as('parameters.update')
  router.delete('/:id', [ParametersController, 'deleteParameter']).as('parameters.delete')

}).prefix('/parameters');
