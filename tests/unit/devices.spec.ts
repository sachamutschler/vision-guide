import { test } from '@japa/runner'
import sinon from 'sinon'
import DevicesController from '../../app/controllers/devices_controller.js'
import Device from '../../app/models/device.js'

test.group('Device Controller Unit Tests', (group) => {
  let sandbox: sinon.SinonSandbox

  group.setup(() => {
    sandbox = sinon.createSandbox()
  })

  group.teardown(() => {
    sandbox.restore()
  })
  group.each.teardown(() => {
    sandbox.restore()
  })

  /**
   * Test: Get all devices
   */
  test('should return all devices', async ({ assert }) => {
    sandbox.stub(Device, 'all').resolves([
      {id: 1, name: 'Sensor X', type: 'Temperature', serial_number: 'SN123'},
    ] as unknown as Device[])

    const controller = new DevicesController()
    const fakeResponse = { json: sinon.spy() }

    await controller.index({ response: fakeResponse } as any)

    assert.isTrue(fakeResponse.json.calledOnce)
    assert.deepEqual(fakeResponse.json.firstCall.args[0], [
      { id: 1, name: 'Sensor X', type: 'Temperature', serial_number: 'SN123' },
    ])
  })
  test('should return 500 if fetching devices fails', async ({ assert }) => {
    sandbox.stub(Device, 'all').rejects(new Error('Database error'))
    const fakeResponse = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    }
    const controller = new DevicesController()
    await controller.index({ response: fakeResponse } as any)
    assert.isTrue(fakeResponse.status.calledOnceWith(500))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'Failed to retrieve devices' })
  })

  /**
   * Test: Get a single device
   */
  test('should return a single device', async ({ assert }) => {
    const device = { id: 1, name: 'Sensor X', type: 'Temperature', serial_number: 'SN123' }

    sandbox.stub(Device, 'findOrFail').resolves(device as unknown as Device)

    const controller = new DevicesController()
    const fakeResponse = { json: sinon.spy() }
    const fakeParams = { id: 1 }

    await controller.show({ params: fakeParams, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.json.calledOnce)
    assert.deepEqual(fakeResponse.json.firstCall.args[0], device)
  })

  /**
   * Test: Get a single device (Not Found)
   */
  test('should return 404 when device is not found', async ({ assert }) => {
    sandbox.stub(Device, 'findOrFail').rejects(new Error('Device not found'))

    const controller = new DevicesController()
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }
    const fakeParams = { id: 99 }

    await controller.show({ params: fakeParams, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(404))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'Device not found' })
  })

  /**
   * Test: Create a new device
   */
  test('should create a new device', async ({ assert }) => {
    const deviceData = { name: 'Camera Y', type: 'Security', serial_number: 'SN789' }
    const createdDevice = { id: 2, ...deviceData }

    sandbox.stub(Device, 'create').resolves(createdDevice as unknown as Device)

    const controller = new DevicesController()
    const fakeRequest = { only: sinon.stub().returns(deviceData) }
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }

    await controller.store({ request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(201))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], createdDevice)
  })

  /**
   * Test: Update a device
   */
  test('should update a device', async ({ assert }) => {
    const device = {
      id: 1,
      name: 'Sensor X',
      type: 'Temperature',
      serial_number: 'SN123',
      merge: sinon.stub(),
      save: sinon.stub().resolves(),
    }

    sandbox.stub(Device, 'findOrFail').resolves(device as unknown as Device)

    const controller = new DevicesController()
    const updateData = { name: 'Updated Sensor' }
    const fakeRequest = { only: sinon.stub().returns(updateData) }
    const fakeResponse = { json: sinon.spy() }
    const fakeParams = { id: 1 }

    await controller.update({ params: fakeParams, request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(device.save.calledOnce)
    assert.deepEqual(fakeResponse.json.firstCall.args[0], device)
  })

  /**
   * Test: Delete a device
   */
  test('should delete a device and return it', async ({ assert }) => {
    const deviceData = { id: 1, name: 'Test Device', type: 'sensor' }
    const device = {
      id: 1,
      delete: sinon.stub().resolves(),
      toJSON: sinon.stub().returns(deviceData)
    }

    sandbox.stub(Device, 'findOrFail').resolves(device as unknown as Device)

    const controller = new DevicesController()
    const fakeResponse = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    }
    const fakeParams = { id: 1 }

    await controller.destroy({ params: fakeParams, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(200))
    assert.isTrue(fakeResponse.json.calledOnceWith(deviceData))
  })


  /**
   * Test: Delete a device (Not Found)
   */
  test('should return 404 when deleting a non-existent device', async ({ assert }) => {
    sandbox.stub(Device, 'findOrFail').rejects(new Error('Device not found'))

    const controller = new DevicesController()
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }
    const fakeParams = { id: 99 }

    await controller.destroy({ params: fakeParams, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(404))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'Device not found' })
  })



  test('should return 400 when device creation fails', async ({ assert }) => {
    const deviceData = { name: 'Camera Y', type: 'Security', serial_number: 'SN789' }

    sandbox.stub(Device, 'create').rejects(new Error('Database error'))

    const controller = new DevicesController()
    const fakeRequest = { only: sinon.stub().returns(deviceData) }
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }

    await controller.store({ request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(400))

    // Correct assertion: Check for Error instance instead of generic object match
    assert.deepEqual(fakeResponse.json.firstCall.args[0], {
      error: 'Database error',
      message: "Error creating device"
    })
  })

  /**
   * Test: Update a device (Not Found)
   * 🔹 Covers Line 52-53
   */
  test('should return 404 when updating a non-existent device', async ({ assert }) => {
    sandbox.stub(Device, 'findOrFail').rejects(new Error('Device not found'))

    const controller = new DevicesController()
    const updateData = { name: 'Updated Sensor' }
    const fakeRequest = { only: sinon.stub().returns(updateData) }
    const fakeResponse = { status: sinon.stub().returnsThis(), json: sinon.spy() }
    const fakeParams = { id: 99 }

    await controller.update({ params: fakeParams, request: fakeRequest, response: fakeResponse } as any)

    assert.isTrue(fakeResponse.status.calledOnceWith(404))
    assert.deepEqual(fakeResponse.json.firstCall.args[0], { message: 'Device not found' })
  })
})
