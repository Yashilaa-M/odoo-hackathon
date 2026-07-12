import { RoleName, VehicleType, VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus, ExpenseCategory } from '../src/prisma-enums';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Roles
  const roles = await Promise.all(
    Object.values(RoleName).map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: {
          name,
          permissions: JSON.stringify({}),
        },
      }),
    ),
  );

  const roleMap = new Map(roles.map((r) => [r.name, r.id]));

  // 2. Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@transitops.com' },
    update: {},
    create: {
      email: 'manager@transitops.com',
      passwordHash,
      fullName: 'John Fleet Manager',
      roleId: roleMap.get(RoleName.FLEET_MANAGER)!,
      isActive: true,
    },
  });

  const driverUser1 = await prisma.user.upsert({
    where: { email: 'driver1@transitops.com' },
    update: {},
    create: {
      email: 'driver1@transitops.com',
      passwordHash,
      fullName: 'Sarah Driver One',
      roleId: roleMap.get(RoleName.DRIVER)!,
      isActive: true,
    },
  });

  const driverUser2 = await prisma.user.upsert({
    where: { email: 'driver2@transitops.com' },
    update: {},
    create: {
      email: 'driver2@transitops.com',
      passwordHash,
      fullName: 'Alex Driver Two',
      roleId: roleMap.get(RoleName.DRIVER)!,
      isActive: true,
    },
  });

  const safetyUser = await prisma.user.upsert({
    where: { email: 'safety@transitops.com' },
    update: {},
    create: {
      email: 'safety@transitops.com',
      passwordHash,
      fullName: 'Alice Safety Officer',
      roleId: roleMap.get(RoleName.SAFETY_OFFICER)!,
      isActive: true,
    },
  });

  const financeUser = await prisma.user.upsert({
    where: { email: 'finance@transitops.com' },
    update: {},
    create: {
      email: 'finance@transitops.com',
      passwordHash,
      fullName: 'Frank Financial Analyst',
      roleId: roleMap.get(RoleName.FINANCIAL_ANALYST)!,
      isActive: true,
    },
  });

  // 3. Vehicles (11 total)
  const vehicleData = [
    { registrationNumber: 'TX-TRK-01', nameModel: 'Freightliner Cascadia', type: VehicleType.TRUCK, maxLoadCapacityKg: 15000, odometerKm: 45200.5, acquisitionCost: 125000, region: 'Texas', status: VehicleStatus.AVAILABLE },
    { registrationNumber: 'CA-TRK-02', nameModel: 'Volvo VNL 860', type: VehicleType.TRUCK, maxLoadCapacityKg: 16000, odometerKm: 12400.0, acquisitionCost: 140000, region: 'California', status: VehicleStatus.ON_TRIP },
    { registrationNumber: 'NY-VAN-03', nameModel: 'Ford Transit 350', type: VehicleType.VAN, maxLoadCapacityKg: 3500, odometerKm: 28900.2, acquisitionCost: 45000, region: 'New York', status: VehicleStatus.AVAILABLE },
    { registrationNumber: 'FL-VAN-04', nameModel: 'Mercedes Sprinter', type: VehicleType.VAN, maxLoadCapacityKg: 4000, odometerKm: 85400.9, acquisitionCost: 52000, region: 'Florida', status: VehicleStatus.IN_SHOP },
    { registrationNumber: 'WA-BIK-05', nameModel: 'RadPower Cargo Electric', type: VehicleType.BIKE, maxLoadCapacityKg: 120, odometerKm: 850.5, acquisitionCost: 3500, region: 'Washington', status: VehicleStatus.AVAILABLE },
    { registrationNumber: 'IL-TRK-06', nameModel: 'Kenworth T680', type: VehicleType.TRUCK, maxLoadCapacityKg: 15500, odometerKm: 198000.0, acquisitionCost: 118000, region: 'Illinois', status: VehicleStatus.RETIRED },
    { registrationNumber: 'GA-TRK-07', nameModel: 'Peterbilt 579', type: VehicleType.TRUCK, maxLoadCapacityKg: 15000, odometerKm: 3400.0, acquisitionCost: 135000, region: 'Georgia', status: VehicleStatus.AVAILABLE },
    { registrationNumber: 'NV-VAN-08', nameModel: 'RAM ProMaster', type: VehicleType.VAN, maxLoadCapacityKg: 3200, odometerKm: 42100.3, acquisitionCost: 41000, region: 'Nevada', status: VehicleStatus.AVAILABLE },
    { registrationNumber: 'AZ-BIK-09', nameModel: 'Tern GSD S10', type: VehicleType.BIKE, maxLoadCapacityKg: 150, odometerKm: 1420.0, acquisitionCost: 4500, region: 'Arizona', status: VehicleStatus.ON_TRIP },
    { registrationNumber: 'CO-VAN-10', nameModel: 'Chevrolet Express', type: VehicleType.VAN, maxLoadCapacityKg: 3400, odometerKm: 98100.6, acquisitionCost: 38000, region: 'Colorado', status: VehicleStatus.AVAILABLE },
    { registrationNumber: 'OR-TRK-11', nameModel: 'Mack Anthem', type: VehicleType.TRUCK, maxLoadCapacityKg: 14800, odometerKm: 5500.0, acquisitionCost: 130000, region: 'Oregon', status: VehicleStatus.AVAILABLE },
  ];

  const vehicles = [];
  for (const v of vehicleData) {
    const veh = await prisma.vehicle.upsert({
      where: { registrationNumber: v.registrationNumber },
      update: {},
      create: v,
    });
    vehicles.push(veh);
  }

  // 4. Drivers (10 total)
  const driverData = [
    { fullName: 'Sarah Driver One', licenseNumber: 'DL-CA-99812', licenseCategory: 'Class A CDL', licenseExpiryDate: new Date('2028-11-20'), contactNumber: '213-555-0199', safetyScore: 98, status: DriverStatus.ON_TRIP, userId: driverUser1.id },
    { fullName: 'Alex Driver Two', licenseNumber: 'DL-TX-55421', licenseCategory: 'Class B CDL', licenseExpiryDate: new Date('2027-05-15'), contactNumber: '512-555-0144', safetyScore: 95, status: DriverStatus.AVAILABLE, userId: driverUser2.id },
    { fullName: 'Marcus Miller', licenseNumber: 'DL-NY-22481', licenseCategory: 'Class A CDL', licenseExpiryDate: new Date('2029-08-04'), contactNumber: '718-555-0182', safetyScore: 90, status: DriverStatus.AVAILABLE },
    { fullName: 'Expired License Joe', licenseNumber: 'DL-FL-00124', licenseCategory: 'Class A CDL', licenseExpiryDate: new Date('2024-04-12'), contactNumber: '305-555-0165', safetyScore: 85, status: DriverStatus.AVAILABLE }, // Expired license
    { fullName: 'Suspended Sam', licenseNumber: 'DL-IL-50063', licenseCategory: 'Class B CDL', licenseExpiryDate: new Date('2028-09-12'), contactNumber: '312-555-0177', safetyScore: 50, status: DriverStatus.SUSPENDED }, // Suspended driver
    { fullName: 'Tina Taylor', licenseNumber: 'DL-GA-77612', licenseCategory: 'Class A CDL', licenseExpiryDate: new Date('2028-03-24'), contactNumber: '404-555-0155', safetyScore: 99, status: DriverStatus.AVAILABLE },
    { fullName: 'Robert Red', licenseNumber: 'DL-NV-44288', licenseCategory: 'Class A CDL', licenseExpiryDate: new Date('2027-10-18'), contactNumber: '702-555-0131', safetyScore: 89, status: DriverStatus.AVAILABLE },
    { fullName: 'Emily Green', licenseNumber: 'DL-WA-88121', licenseCategory: 'Standard DL', licenseExpiryDate: new Date('2029-01-14'), contactNumber: '206-555-0122', safetyScore: 100, status: DriverStatus.ON_TRIP },
    { fullName: 'Dan Davis', licenseNumber: 'DL-AZ-99214', licenseCategory: 'Standard DL', licenseExpiryDate: new Date('2028-02-28'), contactNumber: '602-555-0111', safetyScore: 92, status: DriverStatus.AVAILABLE },
    { fullName: 'Patty Price', licenseNumber: 'DL-CO-33421', licenseCategory: 'Class B CDL', licenseExpiryDate: new Date('2027-06-30'), contactNumber: '303-555-0188', safetyScore: 94, status: DriverStatus.AVAILABLE },
  ];

  const drivers = [];
  for (const d of driverData) {
    const dr = await prisma.driver.upsert({
      where: { licenseNumber: d.licenseNumber },
      update: {},
      create: d,
    });
    drivers.push(dr);
  }

  // Find vehicle and driver mappings by registration and license for accurate linkages
  const vMap = new Map(vehicles.map((v) => [v.registrationNumber, v]));
  const dMap = new Map(drivers.map((d) => [d.licenseNumber, d]));

  // 5. Trips (Historical and Active)
  // Completed trip
  const completedTrip1 = await prisma.trip.create({
    data: {
      source: 'Houston, TX',
      destination: 'Dallas, TX',
      vehicleId: vMap.get('TX-TRK-01')!.id,
      driverId: dMap.get('DL-TX-55421')!.id,
      cargoWeightKg: 8500.0,
      plannedDistanceKm: 390.0,
      actualDistanceKm: 392.5,
      fuelConsumedL: 140.0,
      revenue: 1200.0,
      status: TripStatus.COMPLETED,
      createdBy: managerUser.id,
      dispatchedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  // Seed Fuel Log & Expense for completed trip 1
  await prisma.fuelLog.create({
    data: {
      vehicleId: completedTrip1.vehicleId,
      tripId: completedTrip1.id,
      liters: 140.0,
      cost: 203.0,
      loggedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      createdBy: managerUser.id,
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: completedTrip1.vehicleId,
      tripId: completedTrip1.id,
      category: ExpenseCategory.FUEL,
      amount: 203.0,
      description: 'Fuel log for completed trip',
      incurredDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      createdBy: managerUser.id,
    },
  });

  // Completed trip 2
  const completedTrip2 = await prisma.trip.create({
    data: {
      source: 'Los Angeles, CA',
      destination: 'San Francisco, CA',
      vehicleId: vMap.get('CA-TRK-02')!.id,
      driverId: dMap.get('DL-CA-99812')!.id,
      cargoWeightKg: 12000.0,
      plannedDistanceKm: 610.0,
      actualDistanceKm: 615.0,
      fuelConsumedL: 210.0,
      revenue: 2500.0,
      status: TripStatus.COMPLETED,
      createdBy: managerUser.id,
      dispatchedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    },
  });

  // Seed Fuel Log & Expense for completed trip 2
  await prisma.fuelLog.create({
    data: {
      vehicleId: completedTrip2.vehicleId,
      tripId: completedTrip2.id,
      liters: 210.0,
      cost: 304.5,
      loggedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      createdBy: managerUser.id,
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: completedTrip2.vehicleId,
      tripId: completedTrip2.id,
      category: ExpenseCategory.FUEL,
      amount: 304.5,
      description: 'Fuel log for completed trip',
      incurredDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      createdBy: managerUser.id,
    },
  });

  // Active Dispatched Trips (matches the ON_TRIP status of vehicles CA-TRK-02 and AZ-BIK-09, and drivers DL-CA-99812 and DL-WA-88121)
  await prisma.trip.create({
    data: {
      source: 'San Jose, CA',
      destination: 'Sacramento, CA',
      vehicleId: vMap.get('CA-TRK-02')!.id,
      driverId: dMap.get('DL-CA-99812')!.id,
      cargoWeightKg: 9500.0,
      plannedDistanceKm: 190.0,
      revenue: 900.0,
      status: TripStatus.DISPATCHED,
      createdBy: managerUser.id,
      dispatchedAt: new Date(),
    },
  });

  await prisma.trip.create({
    data: {
      source: 'Seattle, WA (Downtown)',
      destination: 'Seattle, WA (Capitol Hill)',
      vehicleId: vMap.get('AZ-BIK-09')!.id,
      driverId: dMap.get('DL-WA-88121')!.id,
      cargoWeightKg: 45.0,
      plannedDistanceKm: 8.2,
      revenue: 50.0,
      status: TripStatus.DISPATCHED,
      createdBy: managerUser.id,
      dispatchedAt: new Date(),
    },
  });

  // Draft trip
  await prisma.trip.create({
    data: {
      source: 'New York, NY',
      destination: 'Boston, MA',
      vehicleId: vMap.get('NY-VAN-03')!.id,
      driverId: dMap.get('DL-NY-22481')!.id,
      cargoWeightKg: 1500.0,
      plannedDistanceKm: 340.0,
      revenue: 750.0,
      status: TripStatus.DRAFT,
      createdBy: managerUser.id,
    },
  });

  // Cancelled trip
  await prisma.trip.create({
    data: {
      source: 'Miami, FL',
      destination: 'Orlando, FL',
      vehicleId: vMap.get('FL-VAN-04')!.id,
      driverId: dMap.get('DL-FL-00124')!.id,
      cargoWeightKg: 1200.0,
      plannedDistanceKm: 380.0,
      status: TripStatus.CANCELLED,
      createdBy: managerUser.id,
      cancelledAt: new Date(),
    },
  });

  // 6. Maintenance Logs
  // Open active log (matches FL-VAN-04 in IN_SHOP status)
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vMap.get('FL-VAN-04')!.id,
      type: 'Tire Replacement & Brake Inspection',
      description: 'Replacing front and rear brake pads and balancing wheels.',
      cost: 450.0,
      status: MaintenanceStatus.ACTIVE,
      openedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdBy: managerUser.id,
    },
  });

  // Closed historical log (vehicle NY-VAN-03)
  const maintenance1 = await prisma.maintenanceLog.create({
    data: {
      vehicleId: vMap.get('NY-VAN-03')!.id,
      type: 'Oil Change',
      description: 'Routine 10k mile synthetic oil change.',
      cost: 85.0,
      status: MaintenanceStatus.CLOSED,
      openedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      createdBy: managerUser.id,
    },
  });

  // Create corresponding expense for historical maintenance
  await prisma.expense.create({
    data: {
      vehicleId: maintenance1.vehicleId,
      category: ExpenseCategory.MAINTENANCE,
      amount: 85.0,
      description: 'Routine synthetic oil change',
      incurredDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      createdBy: managerUser.id,
    },
  });

  // 7. General Toll / Other Expenses
  await prisma.expense.create({
    data: {
      vehicleId: vMap.get('TX-TRK-01')!.id,
      category: ExpenseCategory.TOLL,
      amount: 45.0,
      description: 'I-35 Highway tolls during dispatch',
      incurredDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      createdBy: managerUser.id,
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: vMap.get('CA-TRK-02')!.id,
      category: ExpenseCategory.OTHER,
      amount: 120.0,
      description: 'Overnight permit parking fees',
      incurredDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      createdBy: managerUser.id,
    },
  });

  console.log('Database successfully seeded!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
