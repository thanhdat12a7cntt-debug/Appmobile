import {  text, uuid, timestamp, jsonb, boolean, pgTable, integer } from "drizzle-orm/pg-core"
import {relations} from "drizzle-orm"

export type OrderStatus= "Failed" | "Pending"| "Success"
export type  UserRole = "Customer"| "Support" | "Admin"
export type checkoutSessionLine = {
    productId : String,
    quantity : number,
    unitPriceCents : number
}



export const user = pgTable("user",{ 
    id : uuid("id").defaultRandom().primaryKey(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    email : text("email").notNull().default(""),
    displayName : text("displayname"),
    role : text("role").$type<UserRole>().notNull().default("Customer"),
    createAt : timestamp("create_at", {withTimezone : true}).defaultNow().notNull(),
    updateAt : timestamp("update_at", {withTimezone : true}).defaultNow().notNull()
})

export const Product = pgTable("product", {
    Id : uuid("id").defaultRandom().primaryKey(),
    slug : text("slug").notNull().unique(),
    Title : text("title").notNull(),
    Size : text("size").notNull(),
    category : text("category").notNull().default("general"),
    Price : integer("price").notNull(),
    currency : text("currency").notNull().default("VND"),

    imageURL : text("image_url"),
    imageKitFile : text("image_kit_file_id"),
    active : boolean("active").notNull().default(true),
    createAt : timestamp("create_at", {withTimezone : true}).defaultNow().notNull()
        
})

export const checkOutSesion = pgTable("checkout_session",{
    id : uuid("id").defaultRandom().primaryKey(),
    userId : uuid("user_id").notNull().references(()=>user.id, {onDelete : 'cascade'}),
    paypalCheckoutId : text("polar_checkout_id").unique(),
    lines : text("lines").$type<checkoutSessionLine>().notNull(),
    totalCents : integer("total_cents").notNull(),
    currency : text("currency").notNull(),
    createAt : timestamp("create_at", {withTimezone : true}).defaultNow().notNull(),
})


export const Order = pgTable("order", {
    id : uuid("id").defaultRandom().primaryKey(),
    userId : uuid("user_id").notNull().references(()=>user.id,{onDelete: "cascade"}),
    status : text("status").$type<OrderStatus>().notNull().default("Pending"),
    paypalCheckoutId : text("paypal_checkout_id"),
    paypalOrderId : text("paypal").unique(),
    totalCent : integer("total_cent").notNull().default(0),
    reateAt : timestamp("create_at", {withTimezone : true}).defaultNow().notNull(),
    updateAt : timestamp("update_at", {withTimezone : true}).defaultNow().notNull()

})  


export const orderItems = pgTable("orderitems",{
    id: uuid("id").notNull().defaultRandom().primaryKey(),
    orderId : uuid("order_id").notNull().references(()=> Order.id,{onDelete : "cascade"}),
    ProductId : uuid("product_id").notNull().references(()=>Product.Id,{onDelete : "cascade"}),
    quantity : integer("quantity").notNull(),
    unitPriceCent : integer("unit_price_cents").notNull()
})


//Relation

export const userRelation = relations(user,({many})=>({
    orders :many(Order)
}))

export const productRelations = relations(Product, ({many})=>({
    ordersItems : many(orderItems)
}) )

export const orderRelations = relations(Order, ({one, many})=>({
    users : one(user, {fields : [Order.userId], references : [user.id]}),
    items : many(orderItems)
}))

export const orderItemsRelations = relations(orderItems, ({one})=>({
    order : one(Order, {fields : [orderItems.orderId], references:[Order.id]}),
    product : one(Product, {fields : [orderItems.ProductId], references : [Product.Id]})
}))

