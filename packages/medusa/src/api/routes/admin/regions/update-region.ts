import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator"
import { EntityManager } from "typeorm"

import { validator } from "../../../../utils/validator"
import RegionService from "../../../../services/region"
import { defaultAdminRegionRelations, defaultAdminRegionFields } from "."

/**
 * @oas [post] /regions/{id}
 * operationId: "PostRegionsRegion"
 * summary: "Update a Region"
 * description: "Updates a Region"
 * x-authenticated: true
 * parameters:
 *   - (path) id=* {string} The ID of the Region.
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         properties:
 *           name:
 *             description: "The name of the Region"
 *             type: string
 *           currency_code:
 *             description: "The 3 character ISO currency code to use for the Region."
 *             type: string
 *             externalDocs:
 *               url: https://en.wikipedia.org/wiki/ISO_4217#Active_codes
 *               description: See a list of codes.
 *           automatic_taxes:
 *             description: "If true Medusa will automatically calculate taxes for carts in this region. If false you have to manually call POST /carts/:id/taxes."
 *             type: boolean
 *           gift_cards_taxable:
 *             description: "Whether gift cards in this region should be applied sales tax when purchasing a gift card"
 *             type: boolean
 *           tax_provider_id:
 *             description: "The ID of the tax provider to use; if null the system tax provider is used"
 *             type: string
 *           tax_code:
 *             description: "An optional tax code the Region."
 *             type: string
 *           tax_rate:
 *             description: "The tax rate to use on Orders in the Region."
 *             type: number
 *           payment_providers:
 *             description: "A list of Payment Provider IDs that should be enabled for the Region"
 *             type: array
 *             items:
 *               type: string
 *           fulfillment_providers:
 *             description: "A list of Fulfillment Provider IDs that should be enabled for the Region"
 *             type: array
 *             items:
 *               type: string
 *           countries:
 *             description: "A list of countries' 2 ISO Characters that should be included in the Region."
 *             type: array
 *             items:
 *               type: string
 * tags:
 *   - Region
 * responses:
 *   200:
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           properties:
 *             region:
 *               $ref: "#/components/schemas/region"
 */
export default async (req, res) => {
  const { region_id } = req.params
  const validated = await validator(AdminPostRegionsRegionReq, req.body)

  const regionService: RegionService = req.scope.resolve("regionService")
  const manager: EntityManager = req.scope.resolve("manager")
  await manager.transaction(async (transactionManager) => {
    return await regionService
      .withTransaction(transactionManager)
      .update(region_id, validated)
  })

  const region = await regionService.retrieve(region_id, {
    select: defaultAdminRegionFields,
    relations: defaultAdminRegionRelations,
  })

  res.status(200).json({ region })
}

export class AdminPostRegionsRegionReq {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  currency_code?: string

  @IsString()
  @IsOptional()
  tax_code?: string

  @IsNumber()
  @IsOptional()
  tax_rate?: number

  @IsBoolean()
  @IsOptional()
  gift_cards_taxable?: boolean

  @IsBoolean()
  @IsOptional()
  automatic_taxes?: boolean

  @IsString()
  @IsOptional()
  tax_provider_id?: string | null

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  payment_providers?: string[]

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fulfillment_providers?: string[]

  // iso_2 country codes
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  countries?: string[]

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>
}
