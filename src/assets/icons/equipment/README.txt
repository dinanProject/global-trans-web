Equipment SVG Icons

Files:
- forklift.svg
- manlift.svg
- telehandler.svg
- crane.svg
- service-truck.svg
- truck-mounted-crane.svg
- skylift.svg
- flatbed.svg
- trailer.svg
- tes.svg
- equipment.svg (fallback)

Recommended destination:
src/assets/icons/equipment/

Angular mapping example:

getEquipmentIcon(code?: string): string {
  const fileByCode: Record<string, string> = {
    FORKLIFT: 'forklift.svg',
    MANLIFT: 'manlift.svg',
    TELEHANDLER: 'telehandler.svg',
    CRANE: 'crane.svg',
    SERVICE_TRUCK: 'service-truck.svg',
    TRUCK_MOUNTED_CRANE: 'truck-mounted-crane.svg',
    SKYLIFT: 'skylift.svg',
    FLATBED: 'flatbed.svg',
    TRAILER: 'trailer.svg',
    TES: 'tes.svg'
  };

  const fileName = fileByCode[(code || '').toUpperCase()] || 'equipment.svg';
  return `assets/icons/equipment/${fileName}`;
}
