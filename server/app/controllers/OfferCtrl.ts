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
import {getManager} from "typeorm";
import {Offer} from "../entities/Offer";
import {Role} from "../../../common/models/Role";
import {User} from "../entities/User";
import {IOffer, OfferRelation, OfferStatus} from "../../../common/models/IOffer";
import {BadRequest, Unauthorized} from "ts-httpexceptions";
import * as _ from 'lodash'
import {CargoStatus} from "../../../common/models/ICargo";
import {Message} from "../entities/Message";

@Controller('/offer')
export class OfferCtrl {

  @Get('/:id')
  async get(@Required() @PathParams("id") id: number) {
    return await getManager().findOne(Offer, id)
  }

  @Get('/my/all')
  @Authenticated({roles: [Role.user]})
  async getUserAllOffers(@Req() request: Express.Request,
                         @QueryParams() params: { status?: OfferStatus }) {

    let user = await request.user as User;
    let query = getManager()
        .createQueryBuilder(Offer, 'offer')
        .innerJoinAndSelect('offer.transport', 'transport')
        .innerJoinAndSelect('offer.cargo', 'cargo')
        .innerJoinAndSelect('transport.owner', 'tUser')
        .innerJoinAndSelect('cargo.owner', 'cUser')
        .where('(tUser.id = :tUserId OR cUser.id = :cUserId)', {tUserId: user.id, cUserId: user.id});

    if (params && params.status) {
      this.validateOfferStatus(params.status);
      query = query.andWhere('offer.status = :status', {status: Number(params.status)});
    }

    return await query.getMany();
  }

  @Get('/messages/:offerId')
  async getMessages(@Required() @PathParams("offerId") offerId: number) {
    return await getManager().find(Message, {
      where: {offer: {id: offerId}},
      relations: ['offer', 'author']
    })
  }

  @Get('')
  async list(@Req() request: Express.Request, @QueryParams() params: any, $relations?: string[]) {

    let offer_where = {};

    _.keys(params).forEach(key => {
      if (!key.startsWith('$')) {
        _.set(offer_where, key, params[key])
      }
    });

    let $order = params['$order'];
    let $select = params['$select'];
    let $skip = params['$skip'];
    let $take = params['$take'];


    let result = await getManager().find(Offer, {
      where: offer_where,
      select: $select ? Array.isArray($select) ? $select : [$select] : undefined,
      skip: $skip,
      take: $take,
      order: $order,
      relations: $relations ? Array.isArray($relations) ? $relations : [$relations] : undefined,

    });
    return result;
  }

  @Get('/cargo/:id')
  async listByCardoId(@Req() request: Express.Request, @QueryParams() params: any, @Required() @PathParams("id") id: number) {

    params['cargo.id'] = id;

    return this.list(request, params, ['cargo', 'cargo.owner', 'transport', 'transport.owner', 'messages', 'messages.author'])
  }

  @Authenticated({roles: [Role.user]})
  @Post('')
  async create(@Req() request: Express.Request, @Required() @BodyParams() body: Offer) {
    let user = await request.user as User;

    this.checkRelation(body, user);

    let result = await getManager().save(Offer, body);
    return result;
  }

  @Authenticated({roles: [Role.user]})
  @Post('/:id')
  async save(@Required() @PathParams("id") id: string, @Req() request: Express.Request, @Required() @BodyParams() body: Offer) {
    let user = await request.user as User;

    this.checkRelation(body, user);

    await getManager().update(Offer, id, body);
    return {message: "OK"}
  }

  @Authenticated({roles: [Role.user]})
  @Post('/:id/delivery')
  async delivery(@Required() @PathParams("id") id: string, @Req() request: Express.Request, @Required() @BodyParams() body: Offer) {
    let user = await request.user as User;

    this.checkRelation(body, user);

    body.status = OfferStatus.COMPLETED;

    body.cargo.status = CargoStatus.DELIVERED;

    await getManager().save(body);
    return {message: "OK"}
  }


  @Authenticated({roles: [Role.admin]})
  @Delete('/:id')
  async remove(@Required() @PathParams("id") id: string) {
    await getManager().delete(Offer, id);
    return {message: "OK"}
  }


  private checkRelation(offer: IOffer, user: User) {
    if (offer.relation === OfferRelation.CARGO_TO_TRANSPORT) {
      if (!user.equalsUser(offer.cargo.owner)) throw new Unauthorized("Offer relation");
    } else if (offer.relation === OfferRelation.TRANSPORT_TO_CARGO) {
      if (!user.equalsUser(offer.transport.owner)) throw new Unauthorized("Offer relation");
    }
  }

  private validateOfferStatus(status: OfferStatus): void | never {
    if (!(Number(status) in OfferStatus)) {
      throw new BadRequest(`Invalud offer status: ${status}`);
    }
  }


}


