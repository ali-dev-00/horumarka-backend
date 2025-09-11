import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateContentManagementDto {
  @ApiProperty({ 
    example: 'hero-section', 
    description: 'Unique section name identifier' 
  })
  @IsString()
  @IsNotEmpty()
  sectionName: string;

  @ApiProperty({ 
    example: JSON.stringify({
      title: "Welcome to Our Platform",
      subtitle: "Learn and Grow with Expert-Led Courses",
      description: "Transform your career with our comprehensive training programs",
      ctaButton: {
        text: "Get Started",
        link: "/courses",
        style: "primary"
      },
      backgroundImage: "/images/hero-bg.jpg",
      features: [
        "Expert Instructors",
        "Industry-Relevant Content",
        "Flexible Learning"
      ]
    }),
    description: 'Section content as JSON string. Example for hero section with title, subtitle, CTA button, and features array' 
  })
  @IsString()
  @IsNotEmpty()
  sectionContent: string;
}

export class UpdateContentManagementDto {
  @ApiProperty({ 
    example: 'hero-section', 
    description: 'Unique section name identifier',
    required: false
  })
  @IsString()
  @IsOptional()
  sectionName?: string;

  @ApiProperty({ 
    example: JSON.stringify({
      title: "Updated Welcome Message",
      subtitle: "Learn and Excel with Our Updated Courses",
      description: "Enhanced learning experience with new features",
      ctaButton: {
        text: "Start Learning",
        link: "/new-courses",
        style: "secondary"
      },
      backgroundImage: "/images/new-hero-bg.jpg",
      features: [
        "AI-Powered Learning",
        "Personalized Content",
        "24/7 Support"
      ],
      stats: {
        students: 10000,
        courses: 150,
        instructors: 50
      }
    }),
    description: 'Updated section content as JSON string. Example shows hero section with stats and enhanced features',
    required: false
  })
  @IsString()
  @IsOptional()
  sectionContent?: string;
}

export class ContentManagementResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  sectionName: string;

  @ApiProperty({
    example: JSON.stringify({
      title: "Welcome to Our Platform",
      subtitle: "Learn and Grow",
      ctaButton: { text: "Get Started", link: "/courses" }
    }),
    description: 'Section content as JSON string'
  })
  sectionContent: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
