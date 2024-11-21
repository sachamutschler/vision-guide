import Router from '@adonisjs/core/services/router'
import router from "@adonisjs/core/services/router";
import FaqsController from "../app/controllers/faqs_controller.js";

Router.group(() => {
  router.get('/', [FaqsController, 'index']).as('faqs.index')
  router.post('/', [FaqsController, 'store']).as('faqs.store')
  router.get('/hidden', [FaqsController, 'hidden']).as('faqs.hidden')
  router.get('/:id', [FaqsController, 'show']).as('faqs.show')
  router.put('/:id', [FaqsController, 'update']).as('faqs.update')
  router.delete('/:id', [FaqsController, 'destroy']).as('faqs.destroy')

}).prefix('/faqs');
