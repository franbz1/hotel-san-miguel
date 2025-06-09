import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetDailyRevenueDto } from './get-daily-revenue.dto';
import { GetMonthlyRevenueDto } from './get-monthly-revenue.dto';
import { GetInvoicesRangeDto } from './get-invoices-range.dto';

describe('Analytics DTOs', () => {
  describe('GetDailyRevenueDto', () => {
    it('debería validar una fecha válida', async () => {
      const dto = plainToInstance(GetDailyRevenueDto, {
        date: '2024-01-15',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('debería fallar con fecha inválida', async () => {
      const dto = plainToInstance(GetDailyRevenueDto, {
        date: 'fecha-invalida',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isDateString).toContain(
        'La fecha debe estar en formato válido (YYYY-MM-DD)',
      );
    });

    it('debería fallar con fecha vacía', async () => {
      const dto = plainToInstance(GetDailyRevenueDto, {
        date: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toContain(
        'La fecha es obligatoria',
      );
    });

    it('debería fallar con fecha undefined', async () => {
      const dto = plainToInstance(GetDailyRevenueDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toContain(
        'La fecha es obligatoria',
      );
    });
  });

  describe('GetMonthlyRevenueDto', () => {
    it('debería validar año y mes válidos', async () => {
      const dto = plainToInstance(GetMonthlyRevenueDto, {
        year: 2024,
        month: 1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('debería fallar con año menor a 1900', async () => {
      const dto = plainToInstance(GetMonthlyRevenueDto, {
        year: 1899,
        month: 1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.min).toContain(
        'El año debe ser mayor o igual a 1900',
      );
    });

    it('debería fallar con año mayor a 2100', async () => {
      const dto = plainToInstance(GetMonthlyRevenueDto, {
        year: 2101,
        month: 1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.max).toContain(
        'El año debe ser menor o igual a 2100',
      );
    });

    it('debería fallar con mes menor a 1', async () => {
      const dto = plainToInstance(GetMonthlyRevenueDto, {
        year: 2024,
        month: 0,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.min).toContain(
        'El mes debe ser mayor o igual a 1',
      );
    });

    it('debería fallar con mes mayor a 12', async () => {
      const dto = plainToInstance(GetMonthlyRevenueDto, {
        year: 2024,
        month: 13,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.max).toContain(
        'El mes debe ser menor o igual a 12',
      );
    });

    it('debería fallar con año no entero', async () => {
      const dto = plainToInstance(GetMonthlyRevenueDto, {
        year: 2024.5,
        month: 1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isInt).toContain(
        'El año debe ser un número entero',
      );
    });

    it('debería fallar con mes no entero', async () => {
      const dto = plainToInstance(GetMonthlyRevenueDto, {
        year: 2024,
        month: 1.5,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isInt).toContain(
        'El mes debe ser un número entero',
      );
    });

    it('debería fallar con campos vacíos', async () => {
      const dto = plainToInstance(GetMonthlyRevenueDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(2);
      expect(
        errors.some((e) =>
          e.constraints?.isNotEmpty?.includes('El año es obligatorio'),
        ),
      ).toBe(true);
      expect(
        errors.some((e) =>
          e.constraints?.isNotEmpty?.includes('El mes es obligatorio'),
        ),
      ).toBe(true);
    });
  });

  describe('GetInvoicesRangeDto', () => {
    it('debería validar fechas válidas con startDate <= endDate', async () => {
      const dto = plainToInstance(GetInvoicesRangeDto, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('debería validar fechas iguales', async () => {
      const dto = plainToInstance(GetInvoicesRangeDto, {
        startDate: '2024-01-15',
        endDate: '2024-01-15',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('debería fallar cuando startDate > endDate', async () => {
      const dto = plainToInstance(GetInvoicesRangeDto, {
        startDate: '2024-01-31',
        endDate: '2024-01-01',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isDateRangeValid).toContain(
        'La fecha de inicio no puede ser mayor que la fecha de fin',
      );
    });

    it('debería fallar con startDate inválida', async () => {
      const dto = plainToInstance(GetInvoicesRangeDto, {
        startDate: 'fecha-invalida',
        endDate: '2024-01-31',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isDateString).toContain(
        'La fecha de inicio debe estar en formato válido (YYYY-MM-DD)',
      );
    });

    it('debería fallar con endDate inválida', async () => {
      const dto = plainToInstance(GetInvoicesRangeDto, {
        startDate: '2024-01-01',
        endDate: 'fecha-invalida',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isDateString).toContain(
        'La fecha de fin debe estar en formato válido (YYYY-MM-DD)',
      );
    });

    it('debería fallar con campos vacíos', async () => {
      const dto = plainToInstance(GetInvoicesRangeDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(2);
      expect(
        errors.some((e) =>
          e.constraints?.isNotEmpty?.includes(
            'La fecha de inicio es obligatoria',
          ),
        ),
      ).toBe(true);
      expect(
        errors.some((e) =>
          e.constraints?.isNotEmpty?.includes('La fecha de fin es obligatoria'),
        ),
      ).toBe(true);
    });

    it('debería fallar con startDate vacía', async () => {
      const dto = plainToInstance(GetInvoicesRangeDto, {
        startDate: '',
        endDate: '2024-01-31',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toContain(
        'La fecha de inicio es obligatoria',
      );
    });

    it('debería fallar con endDate vacía', async () => {
      const dto = plainToInstance(GetInvoicesRangeDto, {
        startDate: '2024-01-01',
        endDate: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toContain(
        'La fecha de fin es obligatoria',
      );
    });
  });
});
