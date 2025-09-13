#!/usr/bin/env python3
"""
Animal Management System - Object Oriented Programming Example
This module demonstrates inheritance, polymorphism, encapsulation, and composition
with a comprehensive animal classification system.
"""

import datetime
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from enum import Enum

# Import Zoo class from target module
try:
    import sys
    sys.path.append('.')
    from target import Zoo
except ImportError:
    # If import fails, create a simple Zoo placeholder
    class Zoo:
        def __init__(self, name, location):
            self.name = name
            self.location = location
            self.animals = []


class AnimalType(Enum):
    """Enumeration for different animal types"""
    MAMMAL = "mammal"
    BIRD = "bird"
    REPTILE = "reptile"
    AMPHIBIAN = "amphibian"
    FISH = "fish"
    INSECT = "insect"


class Habitat(Enum):
    """Enumeration for animal habitats"""
    FOREST = "forest"
    OCEAN = "ocean"
    DESERT = "desert"
    ARCTIC = "arctic"
    GRASSLAND = "grassland"
    WETLAND = "wetland"
    URBAN = "urban"


class DietType(Enum):
    """Enumeration for animal diet types"""
    CARNIVORE = "carnivore"
    HERBIVORE = "herbivore"
    OMNIVORE = "omnivore"
    INSECTIVORE = "insectivore"


class Animal(ABC):
    """Abstract base class for all animals"""
    
    def __init__(self, name: str, species: str, age: int, weight: float, 
                 animal_type: AnimalType, habitat: Habitat, diet: DietType):
        self._name = name
        self._species = species
        self._age = age
        self._weight = weight
        self._animal_type = animal_type
        self._habitat = habitat
        self._diet = diet
        self._health_status = "healthy"
        self._birth_date = datetime.date.today() - datetime.timedelta(days=age*365)
    
    # Property getters and setters
    @property
    def name(self) -> str:
        return self._name
    
    @property
    def species(self) -> str:
        return self._species
    
    @property
    def age(self) -> int:
        return self._age
    
    @age.setter
    def age(self, value: int):
        if value < 0:
            raise ValueError("Age cannot be negative")
        self._age = value
    
    @property
    def weight(self) -> float:
        return self._weight
    
    @weight.setter
    def weight(self, value: float):
        if value <= 0:
            raise ValueError("Weight must be positive")
        self._weight = value
    
    @property
    def animal_type(self) -> AnimalType:
        return self._animal_type
    
    @property
    def habitat(self) -> Habitat:
        return self._habitat
    
    @property
    def diet(self) -> DietType:
        return self._diet
    
    @property
    def health_status(self) -> str:
        return self._health_status
    
    @health_status.setter
    def health_status(self, status: str):
        valid_statuses = ["healthy", "sick", "injured", "recovering"]
        if status not in valid_statuses:
            raise ValueError(f"Invalid health status. Must be one of: {valid_statuses}")
        self._health_status = status
    
    @abstractmethod
    def make_sound(self) -> str:
        """Abstract method for animal sounds"""
        pass
    
    @abstractmethod
    def move(self) -> str:
        """Abstract method for animal movement"""
        pass
    
    def eat(self, food: str) -> str:
        """Method for eating behavior"""
        return f"{self.name} the {self.species} is eating {food}"
    
    def sleep(self) -> str:
        """Method for sleeping behavior"""
        return f"{self.name} is sleeping peacefully"
    
    def get_info(self) -> Dict[str, str]:
        """Get comprehensive animal information"""
        return {
            "name": self.name,
            "species": self.species,
            "age": str(self.age),
            "weight": f"{self.weight} kg",
            "type": self.animal_type.value,
            "habitat": self.habitat.value,
            "diet": self.diet.value,
            "health": self.health_status
        }
    
    def __str__(self) -> str:
        return f"{self.name} - {self.species} ({self.animal_type.value})"
    
    def __repr__(self) -> str:
        return f"Animal(name='{self.name}', species='{self.species}', age={self.age})"


class Mammal(Animal):
    """Mammal class inheriting from Animal"""
    
    def __init__(self, name: str, species: str, age: int, weight: float,
                 habitat: Habitat, diet: DietType, fur_color: str, is_domestic: bool = False):
        super().__init__(name, species, age, weight, AnimalType.MAMMAL, habitat, diet)
        self.fur_color = fur_color
        self.is_domestic = is_domestic
        self.body_temperature = 37.0  # Average mammal body temperature
    
    def regulate_temperature(self) -> str:
        """Mammals are warm-blooded"""
        return f"{self.name} maintains body temperature at {self.body_temperature}°C"
    
    def give_birth(self) -> str:
        """Mammals give live birth"""
        return f"{self.name} gives birth to live offspring"
class Dog(Mammal):
    """Dog class - specific mammal implementation"""
    
    def __init__(self, name: str, age: int, weight: float, breed: str, is_trained: bool = False):
        super().__init__(name, "Canis lupus familiaris", age, weight, 
                        Habitat.URBAN, DietType.OMNIVORE, "varies", True)
        self.breed = breed
        self.is_trained = is_trained
        self.loyalty_level = 10  # Dogs are very loyal
    
    def make_sound(self) -> str:
        return f"{self.name} barks: Woof! Woof!"
    
    def move(self) -> str:
        return f"{self.name} runs on four legs"
    
    def fetch(self, item: str) -> str:
        """Dog-specific behavior"""
        return f"{self.name} fetches the {item} and brings it back"
    
    def sit(self) -> str:
        """Dog training command"""
        if self.is_trained:
            return f"{self.name} sits on command"
        return f"{self.name} doesn't understand the sit command yet"


class Cat(Mammal):
    """Cat class - specific mammal implementation"""
    
    def __init__(self, name: str, age: int, weight: float, breed: str, is_indoor: bool = True):
        super().__init__(name, "Felis catus", age, weight,
                        Habitat.URBAN, DietType.CARNIVORE, "varies", True)
        self.breed = breed
        self.is_indoor = is_indoor
        self.independence_level = 8  # Cats are quite independent
    
    def make_sound(self) -> str:
        return f"{self.name} meows: Meow! Purr..."
    
    def move(self) -> str:
        return f"{self.name} gracefully prowls on silent paws"
    
    def hunt(self, prey: str) -> str:
        """Cat-specific hunting behavior"""
        return f"{self.name} stalks and hunts {prey} with stealth"


class Bird(Animal):
    """Bird class inheriting from Animal"""
    
    def __init__(self, name: str, species: str, age: int, weight: float,
                 habitat: Habitat, diet: DietType, wingspan: float, can_fly: bool = True):
        super().__init__(name, species, age, weight, AnimalType.BIRD, habitat, diet)
        self.wingspan = wingspan
        self.can_fly = can_fly
        self.feather_color = "brown"
    
    def move(self) -> str:
        if self.can_fly:
            return f"{self.name} soars through the sky with a {self.wingspan}m wingspan"
        return f"{self.name} walks on the ground (flightless bird)"
    
    def build_nest(self) -> str:
        """Bird-specific behavior"""
        return f"{self.name} builds a nest for its eggs"


class Eagle(Bird):
    """Eagle class - specific bird implementation"""
    
    def __init__(self, name: str, age: int, weight: float):
        super().__init__(name, "Aquila chrysaetos", age, weight,
                        Habitat.FOREST, DietType.CARNIVORE, 2.3, True)
        self.hunting_altitude = 3000  # meters
    
    def make_sound(self) -> str:
        return f"{self.name} screeches: Screeeech!"
    
    def dive_hunt(self, prey: str) -> str:
        """Eagle-specific hunting behavior"""
        return f"{self.name} dives from {self.hunting_altitude}m to catch {prey}"


def main():
    """Main function to demonstrate the animal management system"""
    # Create a zoo
    central_zoo = Zoo("Central City Zoo", "Downtown")
    
    # Create various animals
    max_dog = Dog("Max", 5, 25.0, "Golden Retriever", True)
    whiskers_cat = Cat("Whiskers", 3, 4.5, "Persian", True)
    liberty_eagle = Eagle("Liberty", 8, 6.2)
    
    # Add animals to zoo
    print(central_zoo.add_animal(max_dog))
    print(central_zoo.add_animal(whiskers_cat))
    print(central_zoo.add_animal(liberty_eagle))
    
    # Demonstrate animal behaviors
    print("\n--- Animal Sounds ---")
    for animal in central_zoo.animals:
        print(animal.make_sound())
    
    print("\n--- Animal Movements ---")
    for animal in central_zoo.animals:
        print(animal.move())
    
    # Feed all animals
    print("\n--- Feeding Time ---")
    feeding_results = central_zoo.feed_all_animals()
    for result in feeding_results:
        print(result)
    
    # Show zoo statistics
    print(f"\n--- Zoo Statistics ---")
    stats = central_zoo.get_zoo_stats()
    for key, value in stats.items():
        print(f"{key.replace('_', ' ').title()}: {value}")
    
    # Demonstrate specific animal behaviors
    print(f"\n--- Specific Behaviors ---")
    print(max_dog.fetch("ball"))
    print(max_dog.sit())
    print(whiskers_cat.hunt("mouse"))
    print(whiskers_cat.purr())
    print(liberty_eagle.dive_hunt("rabbit"))


if __name__ == "__main__":
    main()
