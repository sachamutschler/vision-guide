import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Device extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: number

  @column()
  declare type: number

  @column()
  declare serial_number: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
