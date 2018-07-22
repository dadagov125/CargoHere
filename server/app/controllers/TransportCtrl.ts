import {
  Authenticated,
  BodyParams,
  Controller,
  Delete,
  Get,
  PathParams,
  Post,
  QueryParams,
  Req,
  Required
} from "@tsed/common";

import {User} from "../entities/User";
import {Transport} from "../entities/Transport";
import {Role} from "../../../common/models/Role";
import {Forbidden} from "ts-httpexceptions/lib";
import {getManager} from "typeorm";
import * as _ from "lodash"

@Controller("/transport")
export class TransportCtrl {


  @Get('/:id')
  async get(@Required() @PathParams("id") id: string) {
    return await getManager().findOne(Transport, id, {relations: ['owner', 'cargos', 'offers']})
  }

  @Get('')
  async list(@QueryParams() params: any, @Req() request: Express.Request) {

    let transport_where = {};

    _.keys(params).forEach(key => _.set(transport_where, key, params[key]));

    let $relations = params['$relations'];
    let $order = params['$order'];
    let $select = params['$select'];
    let $skip = params['$skip'];
    let $take = params['$take'];


    return await  getManager().find(Transport, {
      where: transport_where,

      select: $select ? Array.isArray($select) ? $select : [$select] : undefined,
      skip: $skip,
      take: $take,
      order: $order,
      relations: $relations ? Array.isArray($relations) ? $relations : [$relations] : undefined
    })

  }

  @Get('/my/all')
  @Authenticated({roles: [Role.user]})
  async getUserAllTransports(@Req() request: Express.Request) {

    let user = await request.user as User;

    return await getManager()
      .createQueryBuilder(Transport, 'transport')
      .innerJoinAndSelect('transport.cargos', 'cargo')
      .innerJoinAndSelect('transport.offers', 'offer')
      .innerJoinAndSelect('transport.routes', 'route')
      .where('transport."ownerId" = :id', {id: user.id})
      .getMany();
  }

  @Authenticated({roles: [Role.user]})
  @Post('')
  async create(@Req() request: Express.Request, @Required() @BodyParams() body: Transport) {

    if (body.owner.id == request.user.id) {
      return await getManager().save(Transport, body);
    }
  }

  @Authenticated({roles: [Role.user]})
  @Post('/:id')
  async save(@Required() @PathParams("id") id: string, @Req() request: Express.Request, @Required() @BodyParams() body: Transport) {
    if (body.owner.id != request.user.id) throw new Forbidden("Can update only owner");
    await getManager().update(Transport, id, body);
    return {message: "OK"}
  }

  @Authenticated({roles: [Role.admin]})
  @Delete('/:id')
  async remove(@Required() @PathParams("id") id: string) {
    await getManager().delete(Transport, id);
    return {message: "OK"}
  }


}