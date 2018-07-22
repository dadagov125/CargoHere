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
import {Cargo} from "../entities/Cargo";
import {CargoStatus} from "../../../common/models/ICargo";

import {User} from "../entities/User";
import {Unauthorized, BadRequest} from "ts-httpexceptions";
import {Role} from "../../../common/models/Role";
import {getManager, FindConditions, ObjectLiteral} from "typeorm";
import {OfferStatus} from "../../../common/models/IOffer";

@Controller("/cargo")
export class CargoCtrl {

  @Get('/:id')
  async get(@Required() @PathParams("id") id: number) {
    return await getManager().findOne(Cargo, id, {relations: ['owner', 'transport', 'offers']});
  }

  @Get('')
  async list(@Req() request: Express.Request, @QueryParams() params: any) {

    let cargo_where = params;

    let result = await getManager().find(Cargo, {
      where: cargo_where,
      relations: ["owner"]
    });
    return result;
  }

  @Get('/my/all')
  @Authenticated({roles: [Role.user]})
  async getUserAllCargos(
    @Req() request: Express.Request,
    @QueryParams() params: { status?: CargoStatus }
  ) {

    let user = await request.user as User;

    let query = getManager()
      .createQueryBuilder(Cargo, 'cargo')
      .innerJoinAndSelect('cargo.transport', 'transport')
      .innerJoinAndSelect('cargo.offers', 'offers')
      .where('cargo."ownerId" = :id', {id: user.id});

    if (params && params.status) {
      this.validateCargoStatus(params.status);
      query = query.andWhere('cargo.status = :status', { status: Number(params.status) });
    }

    return await query.getMany();
  }

  test(data: any) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(data)
      }, 3000)
    })
  }

  @Authenticated({roles: [Role.user]})
  @Post('')
  async create(@Req() request: Express.Request, @Required() @BodyParams() body: Cargo) {
    let user = await request.user as User;
    body.owner = user;
    body.status = CargoStatus.NEW;
    let result = await getManager().save(Cargo, body);
    return result;
  }

  @Authenticated({roles: [Role.user]})
  @Post('/:id')
  async update(@Required() @PathParams("id") id: number, @Req() request: Express.Request, @Required() @BodyParams() body: Cargo) {
    let user = await request.user as User;
    if (user.id != body.owner.id) throw new Unauthorized("unauthorized");
    await getManager().update(Cargo, id, body);
    return {message: "OK"}
  }

  @Authenticated({roles: [Role.admin]})
  @Delete('/:id')
  async remove(@Required() @PathParams("id") id: number) {
    await getManager().delete(Cargo, id);
    return {message: "OK"}
  }

  @Get('/:cargoId/offer/:offerId/accept')
  async acceptOffer(@Req() request: Express.Request, @Required() @PathParams("cargoId") cargoId: number, @Required() @PathParams("offerId") offerId: number) {


    let cargo: Cargo = await getManager().findOne(Cargo, cargoId, {relations: ['owner', 'transport', 'offers', 'offers.transport']});

    if (cargo.offers && cargo.offers.length > 0) {
      cargo.offers.forEach((value) => {
        if (value.id === offerId) {
          value.status = OfferStatus.ACCEPTED;
          cargo.transport = value.transport
        } else {
          value.status = OfferStatus.REJECTED;
        }
      })
    }

    return await getManager().save(Cargo, cargo);
  }

  @Get('/:cargoId/offer/:offerId/reject')
  async rejectOffer(@Req() request: Express.Request, @Required() @PathParams("cargoId") cargoId: number, @Required() @PathParams("offerId") offerId: number) {


    let cargo: Cargo = await getManager().findOne(Cargo, cargoId, {relations: ['owner', 'transport', 'offers', 'offers.transport']});

    if (cargo.offers && cargo.offers.length > 0) {
      cargo.offers.forEach((value) => {
        if (value.id === offerId) {
          value.status = OfferStatus.REJECTED;
          cargo.transport = null;
        }
      })
    }

    return await getManager().save(Cargo, cargo);
  }

  private validateCargoStatus(status: CargoStatus): void | never {
    if (!(Number(status) in CargoStatus)) {
      throw new BadRequest(`Invalud status: ${status}`);
    }
  }

}