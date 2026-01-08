import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { MovementPdf } from "./MovementPdf";
import type { Movimiento } from "../../types/movimiento.types";
import Button from "../../../../components/ui/Button";
import { Printer } from "lucide-react";

interface PrintMovementPdfButtonProps {
  movimiento: Movimiento;
}

export const PrintMovementPdfButton = ({
  movimiento,
}: PrintMovementPdfButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<MovementPdf movimiento={movimiento} />).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `remito-movimiento-${movimiento.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generando PDF de movimiento:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      variant="outline"
      
    >
      <Printer className="w-4 h-4 mr-2" />
      {isGenerating ? "Generando..." : "Imprimir Remito"}
    </Button>
  );
};
