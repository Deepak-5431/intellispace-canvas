import { Test, TestingModule } from '@nestjs/testing';
import { CanvasesResolver } from './canvases.resolver';

describe('CanvasesResolver', () => {
  let resolver: CanvasesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CanvasesResolver],
    }).compile();

    resolver = module.get<CanvasesResolver>(CanvasesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
