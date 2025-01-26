export interface DtoFactoryInterface<InputDto, OutputDto> {
  create(inputDto: InputDto, ...args: any[]): OutputDto;
}
