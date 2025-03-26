import React from 'react';
import { Card, CardBody, Avatar, Divider } from '@nextui-org/react';
import { User } from 'lucide-react';

interface EvaluatedEmployeeCardProps {
  fullName: string;
  department: string;
}

const EvaluatedEmployeeCard: React.FC<EvaluatedEmployeeCardProps> = ({
  fullName,
  department
}) => {
  return (
    <Card className="mb-6">
      <CardBody>
        <div className="flex items-center gap-4">
          <Avatar
            icon={<User size={24} />}
            classNames={{
              base: "bg-primary/10",
              icon: "text-primary"
            }}
            size="lg"
          />
          <div>
            <h3 className="text-lg font-semibold">{fullName}</h3>
            <p className="text-sm text-gray-500">{department}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default EvaluatedEmployeeCard;