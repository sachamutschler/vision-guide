import { DateTime } from 'luxon'
import {BaseModel, belongsTo, column} from '@adonisjs/lucid/orm'
import * as relations from "@adonisjs/lucid/types/relations";
import User from '#models/user'

export default class Device extends BaseModel {
  @column({isPrimary: true})
  declare id: number

  @column()
  declare name: string

  @column()
  declare type: number

  @column()
  declare serial_number: string

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: relations.BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
