// React import not required with modern JSX transform
import TextField from '../../../../components/form/TextField';
import NumberField from '../../../../components/form/NumberField';
import FormulaSearchSelect from './FormulaSearchSelect';
import ProductInfoCollapse from './ProductInfoCollapse';
import ProductNutritionCollapse from './ProductNutritionCollapse';
import type { Formula } from '../../../formulas/types/formula.types';

type FormState = {
  idFormula: number;
  nombreComercial: string;
  sku: string;
  diasVencimiento: string;
  pesoNeto: number;
  cantPorcionesAportadas: number;
  calculationMode: 'pesoNeto' | 'porciones';
};

type Props = {
  formData: FormState;
  selectedFormula: Formula | null;
  errors: Record<string,string>;
  serverError: string | null;
  onNombreChange: (v:string)=>void;
  onSkuChange: (v:string)=>void;
  onDiasVencimientoChange: (v:string)=>void;
  onFormulaChange: (f:Formula)=>void;
  onCalcModeChange: (m:'pesoNeto'|'porciones')=>void;
  onValueChange: (field:'pesoNeto'|'cantPorcionesAportadas', v:number)=>void;
};

export default function ProductoFormBody({ formData, selectedFormula, errors, serverError, onNombreChange, onSkuChange, onDiasVencimientoChange, onFormulaChange, onCalcModeChange, onValueChange }: Props) {
  return (
    <div className="overflow-y-auto p-6 space-y-6">
      <div>
        <TextField
          id="nombreComercial"
          label="Nombre Comercial"
          error={errors.nombreComercial}
          inputProps={{ value: formData.nombreComercial, onChange: (e)=>onNombreChange(e.target.value), placeholder: 'Ingrese el nombre comercial del producto' }}
        />
      </div>

      <div>
        <TextField
          id="sku"
          label="SKU (código para ecommerce)"
          error={errors.sku}
          inputProps={{ value: formData.sku, onChange: (e)=>onSkuChange(e.target.value), placeholder: 'Ej: PF-CREA-300 (debe coincidir con el SKU en WooCommerce)' }}
        />
      </div>

      <div>
        <TextField
          id="diasVencimiento"
          label="Días de vencimiento"
          error={errors.diasVencimiento}
          inputProps={{ type: 'number', min: 1, value: formData.diasVencimiento, onChange: (e)=>onDiasVencimientoChange(e.target.value), placeholder: 'Ej: 60 — se usa para calcular el vencimiento del lote' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fórmula</label>
        <FormulaSearchSelect
          value={selectedFormula}
          onChange={(f) => onFormulaChange(f)}
          className={`${errors.idFormula ? 'border-red-500' : ''}`}
          noResultsText="No se encontraron fórmulas"
        />
        {errors.idFormula && <p className="mt-1 text-sm text-red-600">{errors.idFormula}</p>}
      </div>

      {selectedFormula && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Método de Cálculo</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="radio" name="calculationMode" value="pesoNeto" checked={formData.calculationMode==='pesoNeto'} onChange={()=>onCalcModeChange('pesoNeto')} className="mr-2 text-[#7c6a55] focus:ring-[#7c6a55]" />
              <span className="text-sm">Ingresar peso neto (calcula porciones automáticamente)</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="calculationMode" value="porciones" checked={formData.calculationMode==='porciones'} onChange={()=>onCalcModeChange('porciones')} className="mr-2 text-[#7c6a55] focus:ring-[#7c6a55]" />
              <span className="text-sm">Ingresar cantidad de porciones (calcula peso neto automáticamente)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Peso Neto (g){formData.calculationMode==='porciones'&&<span className="text-xs text-gray-500"> (calculado)</span>}</label>
              <NumberField value={formData.pesoNeto} onChange={(v)=>onValueChange('pesoNeto',v)} disabled={formData.calculationMode==='porciones'} className={`${errors.pesoNeto ? 'border-red-500' : ''}`} />
              {errors.pesoNeto && <p className="mt-1 text-sm text-red-600">{errors.pesoNeto}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de Porciones{formData.calculationMode==='pesoNeto'&&<span className="text-xs text-gray-500"> (calculado)</span>}</label>
              <NumberField value={formData.cantPorcionesAportadas} onChange={(v)=>onValueChange('cantPorcionesAportadas',v)} disabled={formData.calculationMode==='pesoNeto'} className={`${errors.cantPorcionesAportadas ? 'border-red-500' : ''}`} />
              {errors.cantPorcionesAportadas && <p className="mt-1 text-sm text-red-600">{errors.cantPorcionesAportadas}</p>}
            </div>
          </div>
        </div>
      )}

      <ProductInfoCollapse formula={selectedFormula} pesoNeto={formData.pesoNeto} cantPorciones={formData.cantPorcionesAportadas} />
      <ProductNutritionCollapse formula={selectedFormula} cantPorciones={formData.cantPorcionesAportadas} />

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <div className="text-sm text-red-700">{serverError}</div>
          </div>
        </div>
      )}
    </div>
  );
}
